import React, { useState, useRef, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { XCircleIcon } from "@heroicons/react/24/solid";
import { Textarea, Button, PillToggle } from "@/components/ui";
import { Paperclip } from "lucide-react";
import { Send } from "lucide-react";
import useFileUpload from "@/hooks/useFileUpload";


/**
 * UploadComponent props interface.
 */
interface UploadComponentProps {
  onSendMessage: (formData: FormData) => void;
  disabled: boolean;
}

/**
 * UploadComponent for handling text input and image uploads.
 */
const UploadComponent = ({ onSendMessage, disabled }: UploadComponentProps) => {
  const [text, setText] = useState<string>("");
  const { selectedFiles, imagePreviews, addFiles, removeImage, clear } =
    useFileUpload();
  const formRef = useRef<HTMLFormElement>(null);
  const [isDraft, setIsDraft] = useState<boolean>(false);
  const [preferredCountry] = useState<string>("");

  // File management handled by useFileUpload hook

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      addFiles(acceptedFiles);
    },
    [addFiles]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
    disabled,
    noClick: true, // We use our own button for file input
  });

  const handleRemoveImage = (previewIdToRemove: string) => {
    removeImage(previewIdToRemove);
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
  };

  const handleTextareaKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (formRef.current) {
        formRef.current.requestSubmit();
      }
    }
  };

  // Handler for pasting images from clipboard
  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
      if (!event.clipboardData || !event.clipboardData.items) return;
      const items = Array.from(event.clipboardData.items);
      const imageFiles = items
        .filter(
          (item) => item.kind === "file" && item.type.startsWith("image/")
        )
        .map((item) => item.getAsFile())
        .filter((file): file is File => file !== null);
      if (imageFiles.length > 0) {
        event.preventDefault(); // Prevent image from being pasted as base64 in textarea
        addFiles(imageFiles);
        console.log(
          "[UploadComponent] Images pasted from clipboard:",
          imageFiles.map((f) => f.name)
        );
      }
    },
    [addFiles]
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (disabled || (selectedFiles.length === 0 && !text.trim())) {
      return;
    }
    const formData = new FormData();
    formData.append("newMessageText", text);
    formData.append("isDraft", isDraft ? "true" : "false");
    formData.append("preferredCountry", preferredCountry);
    selectedFiles.forEach((file) => {
      formData.append("images", file, file.name);
    });
    onSendMessage(formData);
    setText("");
    setIsDraft(false);
    clear();
  };

  return (
    <div
      {...getRootProps()}
      className={`p-2 md:p-4 bg-card rounded-lg border border-border transition-all duration-200 ${
        isDragActive
          ? "border-primary bg-primary/10 border-2 border-dashed"
          : ""
      }`}
    >
      <input {...getInputProps()} data-testid="chat-file-input" />
      {isDragActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-primary/5 rounded-lg pointer-events-none z-10">
          <p className="text-primary font-medium">Drop images here...</p>
        </div>
      )}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 relative"
      >
        <div className="flex items-center gap-2 mt-2">
          <Button
            type="button"
            onClick={open}
            size="icon"
            variant="ghost"
            className="mr-1"
            aria-label="Attach image(s)"
            disabled={disabled}
            data-testid="attach-image-button"
          >
            <Paperclip className="w-5 h-5" />
          </Button>
          <PillToggle active={isDraft} onClick={setIsDraft} disabled={disabled}>
            📝 Rewrite Draft
          </PillToggle>
        </div>
        {imagePreviews.length > 0 && (
          <div className="mb-2 md:mb-3 flex flex-wrap gap-1 md:gap-2">
            {imagePreviews.map((preview) => (
              <div
                key={preview.id}
                className="relative group w-20 h-20 md:w-24 md:h-24 border border-border rounded overflow-hidden"
              >
                <img
                  src={preview.url}
                  alt={`Preview ${preview.name}`}
                  className="object-cover w-full h-full"
                  data-testid="chat-image-preview"
                />
                <Button
                  type="button"
                  onClick={() => handleRemoveImage(preview.id)}
                  size="icon"
                  variant="ghost"
                  className="absolute top-0.5 right-0.5 bg-background/80 text-foreground rounded-full p-0.5 hover:bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Remove image ${preview.name}`}
                  disabled={disabled}
                >
                  <XCircleIcon className="h-5 w-5 text-foreground group-hover:text-red-600 transition-colors" />
                </Button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 w-full">
          <Textarea
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleTextareaKeyDown}
            onPaste={handlePaste}
            placeholder={
              selectedFiles.length > 0
                ? "Add context or ask a question..."
                : "Enter text or upload an image..."
            }
            rows={3}
            disabled={disabled}
            className="w-full bg-input text-foreground border-none focus:ring-2 focus:ring-primary/60 focus:border-primary/80 px-2 py-1 md:px-3 md:py-2 text-sm md:text-base min-h-[50px] md:min-h-[60px]"
            data-testid="chat-input"
          />
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            aria-label="Send"
            disabled={disabled || (selectedFiles.length === 0 && !text.trim())}
            data-testid="send-message-button"
          >
            <Send className="w-6 h-6" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UploadComponent;
