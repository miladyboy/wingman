import React, { useState, useRef, useEffect } from 'react';
import { PaperClipIcon, PhotoIcon, XCircleIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';

const UploadComponent = ({ onSendMessage, disabled }) => {
  const [text, setText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const newPreview = URL.createObjectURL(file);
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview(newPreview);
    } else {
      handleRemoveImage();
    }
  };

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (disabled || (!selectedFile && !text.trim())) {
      if (!selectedFile && !text.trim()) {
        alert('Please enter text or upload an image.');
      }
      return;
    }

    onSendMessage(text, selectedFile);

    setText('');
    handleRemoveImage();
  };

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200">
      <form onSubmit={handleSubmit} className="flex flex-col">
        {imagePreview && (
          <div className="mb-3 relative group w-32 h-32 border border-gray-200 rounded overflow-hidden">
            <img
              src={imagePreview}
              alt="Selected preview"
              className="object-cover w-full h-full"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove image"
              disabled={disabled}
            >
              <XCircleIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        <textarea
          value={text}
          onChange={handleTextChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 mb-3 resize-none"
          placeholder={selectedFile ? "Add context or ask a question..." : "Enter text or upload an image..."}
          rows="3"
          disabled={disabled}
        />

        <div className="flex items-center justify-between">
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            ref={fileInputRef}
            disabled={disabled}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`p-2 text-gray-500 hover:text-indigo-600 rounded-full ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={disabled}
            aria-label="Attach image"
          >
            <PhotoIcon className="h-6 w-6" />
          </button>

          <button
            type="submit"
            className={`bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2 rounded-md flex items-center gap-2 transition-colors ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={disabled || (!selectedFile && !text.trim())}
          >
            Send
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadComponent; 