import { v4 as uuidv4 } from "uuid";
import * as path from "path";
import { uploadFilesToStorage } from "../../services/imageUploadService";
import { supabaseAdmin } from "../../services/supabaseService"; // Assuming this is the correct path
import { compressImage } from "../../utils/imageProcessor"; // Added import

// Mock dependencies
jest.mock("uuid");
jest.mock("path");
jest.mock("../../utils/imageProcessor"); // Mock the new utility

// Define these outside the jest.mock for clarity and to allow per-test configuration
const mockUploadFn = jest.fn();
const mockGetPublicUrlFn = jest.fn();

jest.mock("../../services/supabaseService", () => ({
  supabaseAdmin: {
    // This mocks the supabaseAdmin export
    storage: {
      // This mocks supabaseAdmin.storage
      from: jest.fn().mockImplementation((bucketName: string) => {
        // This mockImplementation is for supabaseAdmin.storage.from()
        // It should return an object that has .upload and .getPublicUrl methods
        if (bucketName === "chat-images") {
          return {
            upload: mockUploadFn,
            getPublicUrl: mockGetPublicUrlFn,
          };
        }
        // Fallback for other bucket names if necessary
        return {
          upload: jest
            .fn()
            .mockRejectedValue(new Error(`Unexpected bucket: ${bucketName}`)),
          getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: "" } }),
        };
      }),
    },
  },
}));

const mockedUuidv4 = uuidv4 as jest.Mock;
const mockedPath = path as jest.Mocked<typeof path>;
const mockedCompressImage = compressImage as jest.Mock;

describe("uploadFilesToStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUploadFn.mockReset();
    mockGetPublicUrlFn.mockReset();
    mockedCompressImage.mockReset();

    mockedPath.extname.mockImplementation((p) => "." + p.split(".").pop());
    mockedPath.basename.mockImplementation((p, ext) =>
      p.substring(0, p.length - (ext ? ext.length : 0))
    );
    mockedUuidv4.mockReturnValue("test-uuid");
    mockedCompressImage.mockImplementation(async (buffer: Buffer) =>
      Buffer.from(`compressed-${buffer.toString()}`)
    );
  });

  const mockFilesBase = [
    {
      originalname: "testImage.png",
      mimetype: "image/png",
      buffer: Buffer.from("testPNG"),
      size: 7,
    },
    {
      originalname: "another-image.jpg",
      mimetype: "image/jpeg",
      buffer: Buffer.from("testJPG"),
      size: 7,
    },
    {
      originalname: "document.pdf",
      mimetype: "application/pdf",
      buffer: Buffer.from("testPDF"),
      size: 7,
    },
  ];

  const mockSavedMessage = {
    id: "message-123",
    conversation_id: "conv-456",
    sender: "user",
    content: "Hello",
  };

  const mockUserId = "user-abc";

  it("should upload files, compress images, and return correct records and URLs", async () => {
    mockUploadFn
      .mockResolvedValueOnce({
        data: { path: "public/user-abc/message-123/testImage-test-uuid.jpg" },
        error: null,
      })
      .mockResolvedValueOnce({
        data: {
          path: "public/user-abc/message-123/another-image-test-uuid.jpg",
        },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { path: "public/user-abc/message-123/document-test-uuid.pdf" },
        error: null,
      });
    mockGetPublicUrlFn
      .mockReturnValueOnce({
        data: { publicUrl: "http://s.com/testImage-test-uuid.jpg" },
      })
      .mockReturnValueOnce({
        data: { publicUrl: "http://s.com/another-image-test-uuid.jpg" },
      })
      .mockReturnValueOnce({
        data: { publicUrl: "http://s.com/document-test-uuid.pdf" },
      });
    const result = await uploadFilesToStorage(
      supabaseAdmin,
      [...mockFilesBase],
      mockSavedMessage,
      mockUserId
    );
    expect(mockedCompressImage).toHaveBeenCalledTimes(2);
    expect(mockUploadFn).toHaveBeenCalledTimes(3);
    expect(mockUploadFn).toHaveBeenNthCalledWith(
      1,
      "public/user-abc/message-123/testImage-test-uuid.jpg",
      Buffer.from("compressed-testPNG"),
      { contentType: "image/jpeg", cacheControl: "3600" }
    );
    expect(mockUploadFn).toHaveBeenNthCalledWith(
      2,
      "public/user-abc/message-123/another-image-test-uuid.jpg",
      Buffer.from("compressed-testJPG"),
      { contentType: "image/jpeg", cacheControl: "3600" }
    );
    expect(mockUploadFn).toHaveBeenNthCalledWith(
      3,
      "public/user-abc/message-123/document-test-uuid.pdf",
      mockFilesBase[2].buffer,
      { contentType: "application/pdf", cacheControl: "3600" }
    );
    expect(result.imageRecords[0].content_type).toBe("image/jpeg");
    expect(result.imageRecords[2].content_type).toBe("application/pdf");
  });

  it("should upload original image if compression fails", async () => {
    mockedCompressImage.mockRejectedValueOnce(
      new Error("Compression failed badly!")
    );
    const imageToFail = {
      originalname: "imageToFail.png",
      mimetype: "image/png",
      buffer: Buffer.from("failThis"),
      size: 8,
    };
    mockUploadFn.mockResolvedValueOnce({
      data: { path: "public/user-abc/message-123/imageToFail-test-uuid.png" },
      error: null,
    });
    mockGetPublicUrlFn.mockReturnValueOnce({
      data: { publicUrl: "http://s.com/imageToFail-test-uuid.png" },
    });
    const consoleWarnSpy = jest
      .spyOn(console, "warn")
      .mockImplementation(() => {});
    const result = await uploadFilesToStorage(
      supabaseAdmin,
      [imageToFail],
      mockSavedMessage,
      mockUserId
    );
    expect(mockUploadFn).toHaveBeenCalledWith(
      "public/user-abc/message-123/imageToFail-test-uuid.png",
      imageToFail.buffer,
      { contentType: "image/png", cacheControl: "3600" }
    );
    expect(result.imageRecords[0].content_type).toBe("image/png");
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Failed to compress image imageToFail.png")
    );
    consoleWarnSpy.mockRestore();
  });

  it("should handle file names with special characters safely and compress if image", async () => {
    const specialImageFile = {
      originalname: "te$t*Im&ge!.png",
      mimetype: "image/png",
      buffer: Buffer.from("specialPNG"),
      size: 10,
    };
    // Expecting .jpg because it's an image and compressImage mock will run
    mockUploadFn.mockResolvedValueOnce({
      data: { path: "public/user-abc/message-123/te_t_Im_ge_-test-uuid.jpg" },
      error: null,
    });
    mockGetPublicUrlFn.mockReturnValueOnce({
      data: { publicUrl: "http://s.com/te_t_Im_ge_-test-uuid.jpg" },
    });

    await uploadFilesToStorage(
      supabaseAdmin,
      [specialImageFile],
      mockSavedMessage,
      mockUserId
    );

    expect(mockedCompressImage).toHaveBeenCalledWith(specialImageFile.buffer);
    expect(mockUploadFn).toHaveBeenCalledWith(
      "public/user-abc/message-123/te_t_Im_ge_-test-uuid.jpg", // Path should be .jpg
      Buffer.from("compressed-specialPNG"), // Buffer should be the compressed one
      { contentType: "image/jpeg", cacheControl: "3600" } // ContentType should be image/jpeg
    );
  });

  it("LEGACY-ADAPTED: should continue if some file uploads fail, handling compression correctly", async () => {
    const filesForPartialFailure = [
      {
        originalname: "failCompress.png",
        mimetype: "image/png",
        buffer: Buffer.from("failCompressPNG"),
        size: 7,
      },
      {
        originalname: "succeedCompress.jpg",
        mimetype: "image/jpeg",
        buffer: Buffer.from("succeedCompressJPG"),
        size: 10,
      },
      {
        originalname: "uploadFail.pdf",
        mimetype: "application/pdf",
        buffer: Buffer.from("uploadFailPDF"),
        size: 12,
      },
      {
        originalname: "finalSuccess.gif",
        mimetype: "image/gif",
        buffer: Buffer.from("finalSuccessGIF"),
        size: 15,
      },
    ];

    // Setup compressImage mock behavior for this test
    mockedCompressImage
      .mockImplementationOnce(async () => {
        throw new Error("Compression failed for failCompress.png");
      }) // for failCompress.png
      .mockImplementationOnce(async (b) =>
        Buffer.from(`compressed-${b.toString()}`)
      ) // for succeedCompress.jpg
      .mockImplementationOnce(async (b) =>
        Buffer.from(`compressed-${b.toString()}`)
      ); // for finalSuccess.gif (will be called as it's image/*)

    // Setup uploadFn mock behavior for this test (4 files)
    mockUploadFn
      // 1. failCompress.png (compression fails, original uploaded with .png ext)
      .mockResolvedValueOnce({
        data: {
          path: "public/user-abc/message-123/failCompress-test-uuid.png",
        },
        error: null,
      })
      // 2. succeedCompress.jpg (compression succeeds, uploaded with .jpg ext)
      .mockResolvedValueOnce({
        data: {
          path: "public/user-abc/message-123/succeedCompress-test-uuid.jpg",
        },
        error: null,
      })
      // 3. uploadFail.pdf (upload itself fails, not a compression issue)
      .mockResolvedValueOnce({
        data: null,
        error: new Error("Supabase upload failed for PDF"),
      })
      // 4. finalSuccess.gif (compression succeeds, .jpg ext)
      .mockResolvedValueOnce({
        data: {
          path: "public/user-abc/message-123/finalSuccess-test-uuid.jpg",
        },
        error: null,
      });

    mockGetPublicUrlFn
      .mockReturnValueOnce({
        data: { publicUrl: "http://s.com/failCompress-test-uuid.png" },
      }) // For failCompress.png
      .mockReturnValueOnce({
        data: { publicUrl: "http://s.com/succeedCompress-test-uuid.jpg" },
      }) // For succeedCompress.jpg
      // No getPublicUrl for uploadFail.pdf as upload failed
      .mockReturnValueOnce({
        data: { publicUrl: "http://s.com/finalSuccess-test-uuid.jpg" },
      }); // For finalSuccess.gif

    const consoleWarnSpy = jest
      .spyOn(console, "warn")
      .mockImplementation(() => {});
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const result = await uploadFilesToStorage(
      supabaseAdmin,
      filesForPartialFailure,
      mockSavedMessage,
      mockUserId
    );

    expect(mockedCompressImage).toHaveBeenCalledTimes(3); // failCompress.png, succeedCompress.jpg, finalSuccess.gif
    expect(mockUploadFn).toHaveBeenCalledTimes(filesForPartialFailure.length); // Called for all 4 files

    // Check calls to mockUploadFn
    expect(mockUploadFn).toHaveBeenNthCalledWith(
      1,
      "public/user-abc/message-123/failCompress-test-uuid.png",
      filesForPartialFailure[0].buffer,
      { contentType: "image/png", cacheControl: "3600" }
    );
    expect(mockUploadFn).toHaveBeenNthCalledWith(
      2,
      "public/user-abc/message-123/succeedCompress-test-uuid.jpg",
      Buffer.from("compressed-succeedCompressJPG"),
      { contentType: "image/jpeg", cacheControl: "3600" }
    );
    expect(mockUploadFn).toHaveBeenNthCalledWith(
      3,
      "public/user-abc/message-123/uploadFail-test-uuid.pdf",
      filesForPartialFailure[2].buffer,
      { contentType: "application/pdf", cacheControl: "3600" }
    );
    expect(mockUploadFn).toHaveBeenNthCalledWith(
      4,
      "public/user-abc/message-123/finalSuccess-test-uuid.jpg",
      Buffer.from("compressed-finalSuccessGIF"),
      { contentType: "image/jpeg", cacheControl: "3600" }
    );

    expect(result.imageRecords).toHaveLength(3); // failCompress, succeedCompress, finalSuccess (uploadFail.pdf is skipped)
    expect(result.imageRecords[0].filename).toBe("failCompress.png");
    expect(result.imageRecords[0].content_type).toBe("image/png");
    expect(result.imageRecords[1].filename).toBe("succeedCompress.jpg");
    expect(result.imageRecords[1].content_type).toBe("image/jpeg");
    expect(result.imageRecords[2].filename).toBe("finalSuccess.gif");
    expect(result.imageRecords[2].content_type).toBe("image/jpeg");

    expect(result.imageUrlsForOpenAI).toHaveLength(3);
    expect(result.imageUrlsForOpenAI).toEqual([
      "http://s.com/failCompress-test-uuid.png",
      "http://s.com/succeedCompress-test-uuid.jpg",
      "http://s.com/finalSuccess-test-uuid.jpg",
    ]);

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Failed to compress image failCompress.png")
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "Failed to upload uploadFail.pdf: Supabase upload failed for PDF"
      )
    );
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it("should upload files and return correct records and URLs when userId is null (with compression)", async () => {
    const imageFile = {
      originalname: "onlyImage.jpg",
      mimetype: "image/jpeg",
      buffer: Buffer.from("soloJPG"),
      size: 7,
    };
    mockUploadFn.mockResolvedValueOnce({
      data: { path: "public/message-123/onlyImage-test-uuid.jpg" },
      error: null,
    });
    mockGetPublicUrlFn.mockReturnValueOnce({
      data: { publicUrl: "http://s.com/onlyImage-test-uuid.jpg" },
    });
    const result = await uploadFilesToStorage(
      supabaseAdmin,
      [imageFile],
      mockSavedMessage,
      null
    );
    expect(mockUploadFn).toHaveBeenCalledWith(
      "public/message-123/onlyImage-test-uuid.jpg",
      Buffer.from("compressed-soloJPG"),
      { contentType: "image/jpeg", cacheControl: "3600" }
    );
    expect(result.imageRecords[0].content_type).toBe("image/jpeg");
  });

  it("should handle cases where getPublicUrl does not return a publicUrl", async () => {
    const imageFileToTest = {
      originalname: "noUrl.png",
      mimetype: "image/png",
      buffer: Buffer.from("noUrlPNG"),
      size: 8,
    };
    mockUploadFn.mockResolvedValueOnce({
      data: { path: "public/user-abc/message-123/noUrl-test-uuid.jpg" },
      error: null,
    });
    mockGetPublicUrlFn.mockReturnValueOnce({
      data: { publicUrl: null as any },
    });
    const result = await uploadFilesToStorage(
      supabaseAdmin,
      [imageFileToTest],
      mockSavedMessage,
      mockUserId
    );
    expect(result.imageUrlsForOpenAI).toEqual([]);
    expect(result.imageRecords[0].content_type).toBe("image/jpeg"); // Still compressed
  });

  it("should return empty arrays if no files are provided", async () => {
    const result = await uploadFilesToStorage(
      supabaseAdmin,
      [],
      mockSavedMessage,
      mockUserId
    );
    expect(result.imageRecords).toEqual([]);
    expect(mockUploadFn).not.toHaveBeenCalled();
  });
});
