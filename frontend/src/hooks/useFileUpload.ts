import { useState, useCallback, useEffect } from "react";

/**
 * Metadata for a preview image generated from an uploaded file.
 */
export interface ImagePreview {
  url: string;
  id: string;
  name: string;
}

/**
 * Hook to manage file uploads and previews.
 *
 * @returns Utilities and state for managing uploaded files
 */
export default function useFileUpload() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);

  // Revoke object URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [imagePreviews]);

  /**
   * Add new files and create preview metadata for them.
   */
  const addFiles = useCallback((files: File[]) => {
    if (!files.length) return;
    const newFiles: File[] = [];
    const newPreviews: ImagePreview[] = [];

    files.forEach((file, index) => {
      const id = `${Date.now()}-${Math.random()}-${index}`;
      const url = URL.createObjectURL(file);
      newFiles.push(file);
      newPreviews.push({ url, id, name: file.name });
    });

    setSelectedFiles((prev) => [...prev, ...newFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  }, []);

  /**
   * Remove a file/preview pair by its preview id.
   */
  const removeImage = useCallback((previewId: string) => {
    setImagePreviews((prevPreviews) => {
      const previewToRemove = prevPreviews.find((p) => p.id === previewId);
      if (previewToRemove) {
        URL.revokeObjectURL(previewToRemove.url);
        setSelectedFiles((prevFiles) =>
          prevFiles.filter((file) => file.name !== previewToRemove.name)
        );
      }
      return prevPreviews.filter((p) => p.id !== previewId);
    });
  }, []);

  /**
   * Clear all files and previews.
   */
  const clear = useCallback(() => {
    imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    setSelectedFiles([]);
    setImagePreviews([]);
  }, [imagePreviews]);

  return { selectedFiles, imagePreviews, addFiles, removeImage, clear };
}
