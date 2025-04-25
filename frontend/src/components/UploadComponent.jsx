import React, { useState, useRef, useEffect } from 'react';
import { PaperClipIcon, PhotoIcon, XCircleIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const UploadComponent = ({ onSendMessage, disabled }) => {
  const [text, setText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
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

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    const newFiles = [];
    const newPreviews = [];

    files.forEach((file, index) => {
      const previewId = `${Date.now()}-${index}`;
      const previewUrl = URL.createObjectURL(file);
      newFiles.push(file);
      newPreviews.push({ url: previewUrl, id: previewId, name: file.name });
    });

    setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);
    setImagePreviews(prevPreviews => [...prevPreviews, ...newPreviews]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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

  const handleSubmit = (event) => {
    event.preventDefault();

    if (disabled || (selectedFiles.length === 0 && !text.trim())) {
      if (selectedFiles.length === 0 && !text.trim()) {
        alert('Please enter text or upload an image.');
      }
      return;
    }

    const formData = new FormData();
    formData.append('newMessageText', text);

    selectedFiles.forEach((file) => {
        formData.append('images', file, file.name);
    });

    onSendMessage(formData);

    setText('');
    imagePreviews.forEach(preview => URL.revokeObjectURL(preview.url));
    setSelectedFiles([]);
    setImagePreviews([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200">
      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col">
        {imagePreviews.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {imagePreviews.map((preview) => (
              <div key={preview.id} className="relative group w-24 h-24 border border-gray-200 rounded overflow-hidden">
                <img
                  src={preview.url}
                  alt={`Preview ${preview.name}`}
                  className="object-cover w-full h-full"
                />
                <Button
                  type="button"
                  onClick={() => handleRemoveImage(preview.id)}
                  size="icon"
                  variant="ghost"
                  className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full p-0.5 hover:bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Remove image ${preview.name}`}
                  disabled={disabled}
                >
                  <XCircleIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Textarea
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleTextareaKeyDown}
          placeholder={selectedFiles.length > 0 ? "Add context or ask a question..." : "Enter text or upload an image..."}
          rows={3}
          disabled={disabled}
          className="mb-3"
        />

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
          />
          <Label htmlFor="file-input" className="sr-only">Attach image(s)</Label>
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            size="icon"
            variant="ghost"
            className="text-gray-500 hover:text-indigo-600"
            disabled={disabled}
            aria-label="Attach image(s)"
          >
            <PhotoIcon className="h-6 w-6" />
          </Button>

          <Button
            type="submit"
            className="font-semibold flex items-center gap-2"
            disabled={disabled || (selectedFiles.length === 0 && !text.trim())}
          >
            Send
            <PaperAirplaneIcon className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UploadComponent; 