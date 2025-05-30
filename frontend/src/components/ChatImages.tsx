import React from "react";

interface ChatImagesProps {
  urls: string[];
  failed?: boolean;
  align?: "start" | "end";
  onImageLoad?: (index: number) => void;
}

export default function ChatImages({
  urls,
  failed = false,
  align = "start",
  onImageLoad,
}: ChatImagesProps) {
  if (!urls || urls.length === 0) return null;

  return (
    <div className={`mt-2 flex flex-wrap gap-2 justify-${align}`}>
      {urls.map((url, idx) => (
        <div key={idx} className="relative">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <img
              src={url}
              alt={`Uploaded image ${idx + 1}`}
              className="max-w-[150px] max-h-[150px] sm:max-w-[200px] sm:max-h-[200px] rounded object-cover border border-border hover:opacity-90 transition-opacity"
              style={failed ? { filter: "grayscale(1)", opacity: 0.5 } : {}}
              onLoad={() => onImageLoad && onImageLoad(idx)}
              data-testid="chat-message-image"
            />
          </a>
          {failed && (
            <div className="absolute inset-0 flex items-center justify-center bg-destructive/60 text-white font-bold text-xs rounded">
              Upload failed
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
