import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PhotoIcon, XCircleIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const UploadComponent = ({ onSendMessage, disabled }) => {
  const [text, setText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef(null);
  const formRef = useRef(null);
  const [intent, setIntent] = useState('OneOffReply');
  const [stage, setStage] = useState('Opening');

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

    // Construir el FormData y enviarlo inmediatamente
    const formData = new FormData();
    formData.append('newMessageText', text);
    formData.append('intent', intent);
    formData.append('stage', stage);
    selectedFiles.forEach((file) => {
      formData.append('images', file, file.name);
    });

    onSendMessage(formData);

    // Limpiar el formulario
    setText('');
    setIntent('OneOffReply');
    setStage('Opening');
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
        {/* Dropdowns para Intent y Stage */}
        <div className="flex flex-col md:flex-row gap-2 mb-2">
          <div className="flex flex-col">
            <label className="font-medium mb-1">What do you want?</label>
            <select
              value={intent}
              onChange={e => setIntent(e.target.value)}
              className="border rounded px-2 py-1"
              disabled={disabled}
            >
              <option value="OneOffReply">One-off reply</option>
              <option value="NewSuggestions">New suggestions</option>
              <option value="RefineDraft">Refine draft</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="font-medium mb-1">Where are you in the convo?</label>
            <select
              value={stage}
              onChange={e => setStage(e.target.value)}
              className="border rounded px-2 py-1"
              disabled={disabled}
            >
              <option value="Opening">First message</option>
              <option value="Continue">Mid-chat</option>
              <option value="ReEngage">She ghosted</option>
            </select>
          </div>
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
                  <XCircleIcon className="h-5 w-5" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Textarea as Dropzone */}
        <div
          {...getRootProps()}
          className={`mb-2 md:mb-3 relative rounded-lg transition-colors border border-border ${isDragActive ? 'border-primary bg-primary/10' : ''}`}
        >
          <input {...getInputProps()} />
        <Textarea
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleTextareaKeyDown}
          onPaste={handlePaste}
          placeholder={selectedFiles.length > 0 ? "Add context or ask a question..." : "Enter text or upload an image..."}
          rows={3}
          disabled={disabled}
          className={`w-full bg-input text-foreground border-none focus:ring-2 focus:ring-primary/60 focus:border-primary/80 ${isDragActive ? 'bg-primary/10' : ''} px-2 py-1 md:px-3 md:py-2 text-sm md:text-base min-h-[50px] md:min-h-[60px]`}
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
            disabled={disabled}
            data-testid="chat-file-input"
          />
          <Label htmlFor="file-input" className="sr-only">Attach image(s)</Label>
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            size="icon"
            variant="ghost"
            className="text-muted-foreground hover:text-primary p-1"
            disabled={disabled}
            aria-label="Attach image(s)"
          >
            <PhotoIcon className="h-10 w-10 md:h-7 md:w-7" />
          </Button>

          <Button
            type="submit"
            className="font-semibold flex items-center gap-1 md:gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base h-auto md:h-9"
            disabled={disabled || (selectedFiles.length === 0 && !text.trim())}
            data-testid="send-message-button"
          >
            Send
            <PaperAirplaneIcon className="h-5 w-5 md:h-6 md:h-6" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UploadComponent; 