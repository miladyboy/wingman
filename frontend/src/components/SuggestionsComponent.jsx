import React, { useState } from 'react';

const SuggestionsComponent = ({ suggestions }) => {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Suggested Replies</h2>
      <div className="space-y-4">
        {suggestions.map((suggestion, index) => (
          <div 
            key={index} 
            className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative group"
          >
            <p className="text-gray-700">{suggestion}</p>
            <button
              onClick={() => copyToClipboard(suggestion, index)}
              className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {copiedIndex === index ? 'Copied!' : 'Copy'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestionsComponent; 