import React, { useState, useRef, useEffect, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { useDropzone } from 'react-dropzone';
import { PhotoIcon, XCircleIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const UploadComponent = ({ onSendMessage, disabled }) => {
  const [text, setText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isPending, setIsPending] = useState(false);
  const fileInputRef = useRef(null);
  const formRef = useRef(null);

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

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    addFiles(files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    addFiles(acceptedFiles);
  }, [addFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
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

    // Step 1: Force React to update the loading state and flush to DOM
    flushSync(() => {
      setIsPending(true);
      onSendMessage(null, true); // loadingOnly = true
    });

    // Step 2: Yield to the browser so the UI can update
    await Promise.resolve();

    // Step 3: Now do the heavy work
    const formData = new FormData();
    formData.append('newMessageText', text);
    selectedFiles.forEach((file) => {
      formData.append('images', file, file.name);
    });

    // Step 4: Send the actual message
    onSendMessage(formData);

    // Step 5: Clear the form
    setText('');
    imagePreviews.forEach(preview => URL.revokeObjectURL(preview.url));
    setSelectedFiles([]);
    setImagePreviews([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsPending(false);
  };

  return (
    <div className="p-4 bg-card rounded-lg border border-border">
      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col">
        {imagePreviews.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {imagePreviews.map((preview) => (
              <div key={preview.id} className="relative group w-24 h-24 border border-border rounded overflow-hidden">
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
                  disabled={disabled || isPending}
                >
                  <XCircleIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Textarea as Dropzone */}
        <div
          {...getRootProps()}
          className={`mb-3 relative rounded-lg transition-colors border border-border ${isDragActive ? 'border-primary bg-primary/10' : ''}`}
        >
          <input {...getInputProps()} />
        <Textarea
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleTextareaKeyDown}
          onPaste={handlePaste} // Permite pegar imágenes desde el portapapeles
          placeholder={selectedFiles.length > 0 ? "Add context or ask a question..." : "Enter text or upload an image..."}
          rows={3}
          disabled={disabled || isPending}
          className={`w-full bg-input text-foreground border-none focus:ring-2 focus:ring-primary/60 focus:border-primary/80 ${isDragActive ? 'bg-primary/10' : ''}`}
          data-testid="chat-input"
        />
          {isDragActive && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-primary font-medium text-lg">Drop images here…</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            ref={fileInputRef}
            multiple
            disabled={disabled || isPending}
            data-testid="chat-file-input"
          />
          <Label htmlFor="file-input" className="sr-only">Attach image(s)</Label>
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            size="icon"
            variant="ghost"
            className="text-muted-foreground hover:text-primary"
            disabled={disabled || isPending}
            aria-label="Attach image(s)"
          >
            <PhotoIcon className="h-6 w-6" />
          </Button>

          <Button
            type="submit"
            className="font-semibold flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={disabled || isPending || (selectedFiles.length === 0 && !text.trim())}
            data-testid="send-message-button"
          >
            {isPending ? 'Sending...' : 'Send'}
            <PaperAirplaneIcon className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UploadComponent; 