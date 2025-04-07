import React, { useState } from 'react';

const UploadComponent = ({ onUpload }) => {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    
    // Check if at least one input is provided
    if (!file && !text.trim()) {
      alert('Please provide an image, text, or both.');
      return;
    }
    
    setLoading(true);
    onUpload(file, text)
      .finally(() => setLoading(false));
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        <div className="w-full mb-4">
          <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-1">
            Enter conversation context or question:
          </label>
          <textarea
            id="text-input"
            value={text}
            onChange={handleTextChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 'She just asked what I do for fun' or 'How should I respond to this?'"
            rows="3"
          />
        </div>
        
        <div className="w-full mb-4">
          <label htmlFor="file-input" className="block text-sm font-medium text-gray-700 mb-1">
            Upload screenshot (optional):
          </label>
          <input 
            id="file-input"
            type="file" 
            onChange={handleFileChange} 
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
          />
          {file && (
            <div className="mt-2 text-sm text-gray-500">
              File selected: {file.name}
            </div>
          )}
        </div>
        
        <button 
          type="submit" 
          className="bg-blue-500 hover:bg-blue-600 transition-colors text-white font-semibold px-6 py-2 rounded-md"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Get Suggestions'}
        </button>
      </form>
    </div>
  );
};

export default UploadComponent; 