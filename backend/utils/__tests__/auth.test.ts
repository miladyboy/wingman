import { getUserIdFromAuthHeader } from '../auth';

describe('getUserIdFromAuthHeader', () => {
  let supabaseMock: any;

  beforeEach(() => {
    supabaseMock = {
      auth: {
        getUser: jest.fn(),
      },
    };
  });

  it('returns user id when token is valid and user is found', async () => {
    supabaseMock.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });
    const result = await getUserIdFromAuthHeader('Bearer validtoken', supabaseMock);
    expect(result).toBe('user-123');
    expect(supabaseMock.auth.getUser).toHaveBeenCalledWith('validtoken');
  });

  it('returns null if token is missing', async () => {
    const result = await getUserIdFromAuthHeader(undefined, supabaseMock);
    expect(result).toBeNull();
    expect(supabaseMock.auth.getUser).not.toHaveBeenCalled();
  });

  it('returns null if token does not start with Bearer', async () => {
    const result = await getUserIdFromAuthHeader('Basic sometoken', supabaseMock);
    expect(result).toBeNull();
    expect(supabaseMock.auth.getUser).not.toHaveBeenCalled();
  });

  it('returns null if Supabase returns error', async () => {
    supabaseMock.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid token' },
    });
    const result = await getUserIdFromAuthHeader('Bearer invalidtoken', supabaseMock);
    expect(result).toBeNull();
    expect(supabaseMock.auth.getUser).toHaveBeenCalledWith('invalidtoken');
  });

  it('returns null if Supabase throws', async () => {
    supabaseMock.auth.getUser.mockRejectedValue(new Error('Supabase failure'));
    const result = await getUserIdFromAuthHeader('Bearer sometoken', supabaseMock);
    expect(result).toBeNull();
    expect(supabaseMock.auth.getUser).toHaveBeenCalledWith('sometoken');
  });

  it('returns null if user is not found', async () => {
    supabaseMock.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });
    const result = await getUserIdFromAuthHeader('Bearer validtoken', supabaseMock);
    expect(result).toBeNull();
    expect(supabaseMock.auth.getUser).toHaveBeenCalledWith('validtoken');
  });
}); 