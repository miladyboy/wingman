// Pure utility to build an optimistic user message for UI
/**
 * Builds an optimistic user message object for immediate UI feedback.
 * @param {FormData} formData - The form data containing the message and images.
 * @param {string[]} imageUrls - Array of image preview URLs.
 * @returns {object} Optimistic user message object.
 */
export function buildOptimisticUserMessage(formData, imageUrls) {
  return {
    id: `user-${Date.now()}`,
    sender: 'user',
    content: formData.get('newMessageText'),
    imageUrls,
    optimistic: true,
  };
}

/**
 * Serializes the message history for backend consumption.
 * @param {Array} messages - Array of message objects.
 * @returns {string} JSON string of message history.
 */
export function serializeMessageHistory(messages) {
  return JSON.stringify(
    messages.map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.image_description ? `${m.content || ''}\n[Image Description: ${m.image_description}]` : m.content,
    }))
  );
}

/**
 * Extracts preview URLs from image files in a FormData object.
 * @param {FormData} formData - The form data containing images.
 * @returns {string[]} Array of preview URLs for images.
 */
export function extractImageUrlsFromFiles(formData) {
  const urls = [];
  const images = formData.getAll('images');
  for (const file of images) {
    if (file instanceof File) {
      urls.push(URL.createObjectURL(file));
    }
  }
  return urls;
} 