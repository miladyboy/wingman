import sharp from 'sharp';

const MAX_FILE_SIZE_MB = 1;
const MAX_WIDTH_PX = 1920;
const MAX_HEIGHT_PX = 1080;
const JPEG_QUALITY = 80; // Adjust for desired quality/compression trade-off

/**
 * Compresses an image if it exceeds size or dimension limits.
 * Resizes to fit within MAX_WIDTH_PX and MAX_HEIGHT_PX while maintaining aspect ratio.
 * Converts to JPEG format with specified quality if compression is needed or original is not JPEG.
 *
 * @param originalBuffer The buffer of the original image.
 * @returns A Promise that resolves to the buffer of the compressed (or original, if compliant) image.
 * @throws Error if image processing fails.
 */
export const compressImage = async (originalBuffer: Buffer): Promise<Buffer> => {
  try {
    const image = sharp(originalBuffer);
    const metadata = await image.metadata();

    const needsResize = 
      (metadata.width && metadata.width > MAX_WIDTH_PX) ||
      (metadata.height && metadata.height > MAX_HEIGHT_PX);

    // Convert size from bytes to MB
    const currentSizeMB = (metadata.size || originalBuffer.length) / (1024 * 1024);
    const needsCompression = currentSizeMB > MAX_FILE_SIZE_MB;

    // If no processing is needed and it's already a reasonably compressed format (e.g. JPEG or WebP), return original
    // We check for !needsResize and !needsCompression first.
    // If format is jpeg or webp, and no other processing is needed, we can assume it's fine.
    // Otherwise, we might want to convert to JPEG for better compression than e.g. PNG.
    if (!needsResize && !needsCompression && (metadata.format === 'jpeg' || metadata.format === 'webp')) {
      return originalBuffer;
    }

    let processedImage = image;

    if (needsResize) {
      processedImage = processedImage.resize({
        width: MAX_WIDTH_PX,
        height: MAX_HEIGHT_PX,
        fit: 'inside', // Maintains aspect ratio, fitting within the bounds
        withoutEnlargement: true, // Don't enlarge if image is smaller than max dimensions
      });
    }

    // Always convert to JPEG for consistent output and good compression,
    // especially if resize or size-based compression was needed.
    // Or if original format was something like PNG which is lossless and large.
    return processedImage
      .jpeg({ 
        quality: JPEG_QUALITY,
        progressive: true, // Optional: for progressive JPEG loading
        optimizeScans: true, // Optional: optimize JPEG scans
       })
      .toBuffer();

  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Failed to process image.');
  }
}; 