import { createConversation, sendMessageToBackend } from '../messageService';

describe('messageService', () => {
  describe('createConversation', () => {
    it('should return data on success', async () => {
      const mockData = { id: '123', title: 'Test' };
      const supabase = {
        from: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      };
      const result = await createConversation(supabase, 'user1', 'Test');
      expect(result).toEqual(mockData);
    });
    it('should throw if error returned', async () => {
      const supabase = {
        from: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: new Error('fail') }),
      };
      await expect(createConversation(supabase, 'user1', 'Test')).rejects.toThrow('fail');
    });
    it('should throw if no data returned', async () => {
      const supabase = {
        from: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      };
      await expect(createConversation(supabase, 'user1', 'Test')).rejects.toThrow('Failed to create conversation: No data returned.');
    });
  });

  describe('sendMessageToBackend', () => {
    it('should call fetch with correct params', async () => {
      const mockFetch = jest.fn().mockResolvedValue({ ok: true });
      const formData = new FormData();
      await sendMessageToBackend('http://api', 'token', formData, mockFetch);
      expect(mockFetch).toHaveBeenCalledWith('http://api/analyze', expect.objectContaining({
        method: 'POST',
        headers: { Authorization: 'Bearer token' },
        body: formData,
      }));
    });
  });
}); 