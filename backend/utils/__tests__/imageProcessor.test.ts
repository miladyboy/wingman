import sharp from 'sharp';
import { compressImage } from '../imageProcessor';

// Helper function to create a dummy image buffer
const createDummyImage = async (width: number, height: number, format: keyof sharp.FormatEnum = 'png', sizeBytes?: number): Promise<Buffer> => {
  let image = sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 255, g: 0, b: 0, alpha: 0.5 },
    },
  });

  if (format === 'jpeg') {
    image = image.jpeg({ quality: 90 }); // High quality for testing distinct sizes
  } else if (format === 'webp') {
    image = image.webp({ quality: 90 });
  } else {
    image = image.png();
  }
  
  let buffer = await image.toBuffer();

  // If a specific size is requested, try to adjust quality for JPEGs to meet it (approximate)
  // This is tricky and might not be exact, mostly for testing the >1MB condition
  if (sizeBytes && format === 'jpeg') {
    let quality = 80;
    while (buffer.length < sizeBytes && quality <= 100) {
        buffer = await sharp({ create: { width, height, channels: 4, background: 'red'}}).jpeg({ quality }).toBuffer();
        quality += 5;
    }
    while (buffer.length > sizeBytes && quality >= 10) {
        buffer = await sharp({ create: { width, height, channels: 4, background: 'red'}}).jpeg({ quality }).toBuffer();
        quality -= 5;
    }
  } else if (sizeBytes && format === 'png') {
    // For PNG, it's harder to control size precisely by generation parameters for arbitrary content.
    // This will make a PNG that's roughly a certain size by repeating a pattern if it's too small.
    // This is a very rough approximation for testing the size threshold.
    if (buffer.length < sizeBytes) {
        const repeats = Math.ceil(sizeBytes / buffer.length);
        const baseData = await sharp(buffer).raw().toBuffer({ resolveWithObject: true });
        const repeatedData = Buffer.concat(Array(repeats).fill(baseData.data));
        if (baseData.info.channels * baseData.info.width * baseData.info.height * repeats > 0) {
            try {
                 buffer = await sharp(repeatedData, { raw: { width: baseData.info.width, height: baseData.info.height * repeats, channels: baseData.info.channels } }).png().toBuffer();
            } catch (e) {
                // If creation fails (e.g. too large for sharp to handle raw), keep original buffer for test
            }
        }
    }
  }

  return buffer;
};

describe('compressImage utility', () => {
  const MAX_WIDTH_PX = 1920;
  const MAX_HEIGHT_PX = 1080;
  const MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024;

  it('should not compress an image that is already compliant (JPEG)', async () => {
    const compliantImageBuffer = await createDummyImage(800, 600, 'jpeg');
    const compressedBuffer = await compressImage(compliantImageBuffer);
    // Expecting the original buffer to be returned if no processing needed for JPEG.
    expect(compressedBuffer).toBe(compliantImageBuffer);
  });

  it('should not compress an image that is already compliant (WebP)', async () => {
    const compliantImageBuffer = await createDummyImage(800, 600, 'webp');
    const compressedBuffer = await compressImage(compliantImageBuffer);
    // Expecting the original buffer to be returned if no processing needed for WebP.
    expect(compressedBuffer).toBe(compliantImageBuffer);
  });

  it('should compress a PNG image that is within dimension limits but could be smaller as JPEG', async () => {
    const pngBuffer = await createDummyImage(800, 600, 'png'); // PNGs are usually larger
    const originalSize = pngBuffer.length;
    const compressedBuffer = await compressImage(pngBuffer);
    const compressedMetadata = await sharp(compressedBuffer).metadata();
    expect(compressedMetadata.format).toBe('jpeg');
    expect(compressedBuffer.length).toBeLessThanOrEqual(originalSize);
    // It might not always be smaller if the PNG was already very optimized or simple,
    // but for typical photos, JPEG conversion will compress.
  });

  it('should resize an image wider than MAX_WIDTH_PX', async () => {
    const wideImageBuffer = await createDummyImage(MAX_WIDTH_PX + 100, 600, 'png');
    const compressedBuffer = await compressImage(wideImageBuffer);
    const metadata = await sharp(compressedBuffer).metadata();
    expect(metadata.width).toBeLessThanOrEqual(MAX_WIDTH_PX);
    expect(metadata.format).toBe('jpeg');
  });

  it('should resize an image taller than MAX_HEIGHT_PX', async () => {
    const tallImageBuffer = await createDummyImage(800, MAX_HEIGHT_PX + 100, 'png');
    const compressedBuffer = await compressImage(tallImageBuffer);
    const metadata = await sharp(compressedBuffer).metadata();
    expect(metadata.height).toBeLessThanOrEqual(MAX_HEIGHT_PX);
    expect(metadata.format).toBe('jpeg');
  });

  it('should resize and maintain aspect ratio', async () => {
    const originalWidth = MAX_WIDTH_PX + 200;
    const originalHeight = MAX_HEIGHT_PX + 100;
    const originalAspectRatio = originalWidth / originalHeight;
    const oversizedImageBuffer = await createDummyImage(originalWidth, originalHeight, 'png');
    const compressedBuffer = await compressImage(oversizedImageBuffer);
    const metadata = await sharp(compressedBuffer).metadata();
    expect(metadata.width).toBeLessThanOrEqual(MAX_WIDTH_PX);
    expect(metadata.height).toBeLessThanOrEqual(MAX_HEIGHT_PX);
    const newAspectRatio = metadata.width! / metadata.height!;
    expect(newAspectRatio).toBeCloseTo(originalAspectRatio, 1); // Allow slight precision diff
    expect(metadata.format).toBe('jpeg');
  });

  // This test now uses a static >1MB JPEG fixture for reliability.
  it('should compress an image larger than MAX_FILE_SIZE_MB', async () => {
    const fs = require('fs');
    const path = require('path');
    const fixturePath = path.join(__dirname, '__fixtures__', 'large-test-image.png');
    const largeImageBuffer = fs.readFileSync(fixturePath);
    expect(largeImageBuffer.length).toBeGreaterThan(MAX_FILE_SIZE_BYTES);
    const compressedBuffer = await compressImage(largeImageBuffer);
    expect(compressedBuffer.length).toBeLessThanOrEqual(MAX_FILE_SIZE_BYTES);
    const metadata = await sharp(compressedBuffer).metadata();
    expect(metadata.format).toBe('jpeg');
  });

  it('should handle an image that needs both resize and compression', async () => {
    const veryLargeImageBuffer = await createDummyImage(3000, 2000, 'png'); // PNG, so likely large and needs conversion
    const compressedBuffer = await compressImage(veryLargeImageBuffer);
    const metadata = await sharp(compressedBuffer).metadata();
    expect(metadata.width).toBeLessThanOrEqual(MAX_WIDTH_PX);
    expect(metadata.height).toBeLessThanOrEqual(MAX_HEIGHT_PX);
    expect(compressedBuffer.length).toBeLessThanOrEqual(MAX_FILE_SIZE_BYTES);
    expect(metadata.format).toBe('jpeg');
  });

  it('should not enlarge an image smaller than max dimensions', async () => {
    const smallImageBuffer = await createDummyImage(100, 100, 'jpeg');
    const compressedBuffer = await compressImage(smallImageBuffer);
    const metadata = await sharp(compressedBuffer).metadata();
    // If original was jpeg and small, it should return original buffer
    if (smallImageBuffer.length === compressedBuffer.length) { 
        expect(metadata.width).toBe(100);
        expect(metadata.height).toBe(100);
    } else { // If it was processed (e.g. a small PNG converted to JPEG)
        expect(metadata.width).toBe(100);
        expect(metadata.height).toBe(100);
        expect(metadata.format).toBe('jpeg');
    }
  });

  it('should throw an error for invalid image buffer', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const invalidBuffer = Buffer.from('this is not an image');
    await expect(compressImage(invalidBuffer)).rejects.toThrow('Failed to process image.');
    consoleErrorSpy.mockRestore();
  });
}); 