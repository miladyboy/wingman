import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { XCircleIcon } from '@heroicons/react/24/solid';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Paperclip } from 'lucide-react';
import { Send } from 'lucide-react';

// PillToggle inline component
function PillToggle({ active, onClick, disabled, children }) {
  return (
    <button
      type="button"
      role="button"
      aria-pressed={active}
      disabled={disabled}
      tabIndex={0}
      onClick={() => !disabled && onClick(!active)}
      className={`
        px-4 py-1 rounded-full font-medium transition
        ${active ? 'bg-primary text-white shadow' : 'bg-muted text-foreground border border-border'}
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}
        focus:outline-none focus:ring-2 focus:ring-primary/60
      `}
      style={{ minWidth: 120 }}
    >
      {children}
    </button>
  );
}

const UploadComponent = ({ onSendMessage, disabled }) => {
  const [text, setText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef(null);
  const formRef = useRef(null);
  const [isDraft, setIsDraft] = useState(false);
  const [preferredCountry] = useState('');

  useEffect(() => {
    const currentPreviewUrls = imagePreviews.map(p => p.url);
    return () => {
        imagePreviews.forEach(preview => {
            if (!currentPreviewUrls.includes(preview.url)) {
                 URL.revokeObjectURL(preview.url);
            }
        });
        if (imagePreviews.length > 0 && !currentPreviewUrls.length) {
            imagePreviews.forEach(preview => URL.revokeObjectURL(preview.url));
        }
    };
  }, [imagePreviews]);

  const addFiles = useCallback((files) => {
    if (!files.length) return;
    const newFiles = [];
    const newPreviews = [];
    files.forEach((file, index) => {
      const previewId = `${Date.now()}-${Math.random()}-${index}`;
      const previewUrl = URL.createObjectURL(file);
      newFiles.push(file);
      newPreviews.push({ url: previewUrl, id: previewId, name: file.name });
    });
    setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);
    setImagePreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
  }, []);

  const onDrop = useCallback((acceptedFiles) => {
    addFiles(acceptedFiles);
  }, [addFiles]);

  useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true,
    disabled,
    noClick: true, // We use our own button for file input
  });

  const handleRemoveImage = (previewIdToRemove) => {
    setImagePreviews(prevPreviews => {
      const previewToRemove = prevPreviews.find(p => p.id === previewIdToRemove);
      if (previewToRemove) {
        URL.revokeObjectURL(previewToRemove.url);
      }
      return prevPreviews.filter(p => p.id !== previewIdToRemove);
    });

    setSelectedFiles(prevFiles => {
      const previewToRemove = imagePreviews.find(p => p.id === previewIdToRemove);
      return prevFiles.filter(file => !(previewToRemove && file.name === previewToRemove.name));
    });
  };

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  const handleTextareaKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (formRef.current) {
        formRef.current.requestSubmit();
      }
    }
  };

  // Handler para pegar imágenes desde el portapapeles
  const handlePaste = useCallback((event) => {
    if (!event.clipboardData || !event.clipboardData.items) return;
    const items = Array.from(event.clipboardData.items);
    const imageFiles = items
      .filter(item => item.kind === 'file' && item.type.startsWith('image/'))
      .map(item => item.getAsFile())
      .filter(Boolean);
    if (imageFiles.length > 0) {
      event.preventDefault(); // Evita que la imagen se pegue como base64 en el textarea
      addFiles(imageFiles);
      console.log('[UploadComponent] Imágenes pegadas desde el portapapeles:', imageFiles.map(f => f.name));
    }
  }, [addFiles]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (disabled || (selectedFiles.length === 0 && !text.trim())) {
      return;
    }
    const formData = new FormData();
    formData.append('newMessageText', text);
    formData.append('isDraft', isDraft ? 'true' : 'false');
    formData.append('preferredCountry', preferredCountry);
    selectedFiles.forEach((file) => {
      formData.append('images', file, file.name);
    });
    onSendMessage(formData);
    setText('');
    setIsDraft(false);
    imagePreviews.forEach(preview => URL.revokeObjectURL(preview.url));
    setSelectedFiles([]);
    setImagePreviews([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-2 md:p-4 bg-card rounded-lg border border-border">
      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex items-center gap-2 mt-2">
          <Button
            type="button"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            size="icon"
            variant="ghost"
            className="mr-1"
            aria-label="Attach image(s)"
            disabled={disabled}
            data-testid="attach-image-button"
          >
            <Paperclip className="w-5 h-5" />
          </Button>
          <input
            type="file"
            multiple
            accept="image/*"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={e => addFiles(Array.from(e.target.files))}
            data-testid="chat-file-input"
          />
          <PillToggle active={isDraft} onClick={setIsDraft} disabled={disabled}>
            📝 Rewrite Draft
          </PillToggle>
        </div>
        {imagePreviews.length > 0 && (
          <div className="mb-2 md:mb-3 flex flex-wrap gap-1 md:gap-2">
            {imagePreviews.map((preview) => (
              <div key={preview.id} className="relative group w-20 h-20 md:w-24 md:h-24 border border-border rounded overflow-hidden">
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
            placeholder={selectedFiles.length > 0 ? "Add context or ask a question..." : "Enter text or upload an image..."}
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