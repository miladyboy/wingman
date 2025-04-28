import { saveMessageStub } from '../analyzeController';

describe('saveMessageStub', () => {
  const mockSupabase = {
    from: jest.fn()
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns the new message record on success', async () => {
    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: { id: '1', conversation_id: 'abc', sender: 'user', content: 'hello' },
          error: null
        })
      })
    });
    mockSupabase.from.mockReturnValue({ insert: mockInsert });

    const result = await saveMessageStub(mockSupabase as any, 'abc', 'hello');
    expect(result).toEqual({ id: '1', conversation_id: 'abc', sender: 'user', content: 'hello' });
    expect(mockSupabase.from).toHaveBeenCalledWith('messages');
  });

  it('throws an error if supabase returns a 23503 error', async () => {
    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: '23503', message: 'Invalid conversation ID' }
        })
      })
    });
    mockSupabase.from.mockReturnValue({ insert: mockInsert });

    await expect(saveMessageStub(mockSupabase as any, 'badid', 'hello')).rejects.toThrow('Invalid conversation ID: badid. Cannot save message.');
  });

  it('throws an error if supabase returns a generic error', async () => {
    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: '12345', message: 'Some error' }
        })
      })
    });
    mockSupabase.from.mockReturnValue({ insert: mockInsert });

    await expect(saveMessageStub(mockSupabase as any, 'abc', 'hello')).rejects.toThrow('Failed to save message stub: Some error');
  });
}); 