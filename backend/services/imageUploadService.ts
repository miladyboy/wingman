import * as path from "path";
import { v4 as uuidv4 } from "uuid";
import { compressImage } from "../utils/imageProcessor";

/**
 * Represents an uploaded file coming from the multipart/form-data request handled by Multer.
 */
export interface UploadedFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

/**
 * Record persisted into the `ChatMessageImages` table once upload is complete.
 */
export interface ImageRecord {
  message_id: string;
  storage_path: string;
  filename: string;
  content_type: string;
  filesize: number;
}

/**
 * Handles compressing (when applicable) and uploading user-provided files to Supabase Storage.
 * Returns the DB records that must be inserted once upload succeeds.
 */
export async function uploadFilesToStorage(
  supabase: any,
  files: UploadedFile[],
  savedMessage: { id: string },
  userId: string | null
): Promise<{
  imageRecords: ImageRecord[];
}> {
  const imageRecords: ImageRecord[] = [];

  for (const file of files) {
    const originalFileExt = path.extname(file.originalname);
    const fileNameWithoutExt = path.basename(
      file.originalname,
      originalFileExt
    );
    // Replace any unsafe characters to avoid issues in Storage paths
    const safeFileNameBase = fileNameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, "_");

    let processedBuffer = file.buffer;
    let processedMimeType = file.mimetype;
    let processedSize = file.size;
    let processedFileExt = originalFileExt; // defaults to original extension

    // ----- Image compression (jpeg output) -----
    if (file.mimetype.startsWith("image/")) {
      try {
        processedBuffer = await compressImage(file.buffer);
        processedMimeType = "image/jpeg";
        processedSize = processedBuffer.length;
        processedFileExt = ".jpg"; // normalise to jpeg once compressed
      } catch (compressionError) {
        // If compression fails, fall back to original buffer/metadata
        console.warn(
          `Failed to compress image ${file.originalname}, uploading original. Error: ${compressionError}`
        );
      }
    }

    // Build a unique filename/path so that collisions are impossible and files are grouped per-message
    const uniqueFileName = `${safeFileNameBase}-${uuidv4()}${processedFileExt}`;
    const storageDirPath = userId
      ? `${userId}/${savedMessage.id}`
      : `${savedMessage.id}`;
    const storagePath = `${storageDirPath}/${uniqueFileName}`;

    const { data: uploadData, error: uploadError } = await supabase!.storage
      .from("chat-images")
      .upload(storagePath, processedBuffer, {
        contentType: processedMimeType,
        cacheControl: "3600",
      });

    if (uploadError) {
      console.error(
        `Failed to upload ${file.originalname}: ${uploadError.message}`
      );
      // Continue with next file instead of aborting the whole batch
      continue;
    }

    if (!uploadData || !uploadData.path) {
      console.error(
        `Upload data or path is missing for ${file.originalname}. Skipping this file.`
      );
      continue;
    }

    // File successfully uploaded; prepare DB record
    imageRecords.push({
      message_id: savedMessage.id,
      storage_path: uploadData.path,
      filename: file.originalname,
      content_type: processedMimeType,
      filesize: processedSize,
    });
  }

  return { imageRecords };
}
