import { buildOptimisticUserMessage, serializeMessageHistory, extractImageUrlsFromFiles } from '../messageUtils';

describe('messageUtils', () => {
  describe('buildOptimisticUserMessage', () => {
    it('should build a user message with text and image URLs', () => {
      const formData = new FormData();
      formData.set('newMessageText', 'Hello world');
      const imageUrls = ['blob:http://localhost/1', 'blob:http://localhost/2'];
      const msg = buildOptimisticUserMessage(formData, imageUrls);
      expect(msg.sender).toBe('user');
      expect(msg.content).toBe('Hello world');
      expect(msg.imageUrls).toEqual(imageUrls);
      expect(msg.optimistic).toBe(true);
      expect(msg.id).toMatch(/^user-/);
    });
  });

  describe('serializeMessageHistory', () => {
    it('should serialize messages with correct roles and content', () => {
      const messages = [
        { sender: 'user', content: 'Hi' },
        { sender: 'ai', content: 'Hello', image_description: 'A cat' },
      ];
      const json = serializeMessageHistory(messages);
      expect(JSON.parse(json)).toEqual([
        { role: 'user', content: 'Hi' },
        { role: 'assistant', content: 'Hello\n[Image Description: A cat]' },
      ]);
    });
  });

  describe('extractImageUrlsFromFiles', () => {
    it('should return empty array if no images', () => {
      const formData = new FormData();
      expect(extractImageUrlsFromFiles(formData)).toEqual([]);
    });
    it('should return URLs for File instances', () => {
      const originalCreateObjectURL = URL.createObjectURL;
      URL.createObjectURL = jest.fn(() => 'mock-url');
      const file1 = new File(['foo'], 'foo.png', { type: 'image/png' });
      const file2 = new File(['bar'], 'bar.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('images', file1);
      formData.append('images', file2);
      const urls = extractImageUrlsFromFiles(formData);
      expect(urls).toEqual(['mock-url', 'mock-url']);
      URL.createObjectURL = originalCreateObjectURL;
    });
  });
}); 