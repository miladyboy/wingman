import { render, act, screen } from '@testing-library/react';
import { useAuthSession } from './useAuthSession';

// Mock supabase client
jest.mock('../services/supabaseClient', () => {
  return {
    supabase: {
      auth: {
        getSession: jest.fn(),
        onAuthStateChange: jest.fn(),
      },
    },
  };
});

import { supabase } from '../services/supabaseClient';

type Session = { user: { id: string } };
type AuthError = { message: string };

function TestComponent() {
  const { session, loading, error } = useAuthSession();
  return (
    <div>
      <div data-testid="loading">{loading ? 'true' : 'false'}</div>
      <div data-testid="session">{session ? session.user.id : 'null'}</div>
      <div data-testid="error">{error ? error.message : 'null'}</div>
    </div>
  );
}

describe('useAuthSession', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns loading initially, then session when authenticated', async () => {
    const fakeSession: Session = { user: { id: 'user-123' } };
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({ data: { session: fakeSession } });
    (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation((_cb: any) => ({ data: { subscription: { unsubscribe: jest.fn() } } }));

    await act(async () => {
      render(<TestComponent />);
    });

    expect(screen.getByTestId('loading').textContent).toBe('false');
    expect(screen.getByTestId('session').textContent).toBe('user-123');
    expect(screen.getByTestId('error').textContent).toBe('null');
  });

  it('returns null session when unauthenticated', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({ data: { session: null } });
    (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation((_cb: any) => ({ data: { subscription: { unsubscribe: jest.fn() } } }));

    await act(async () => {
      render(<TestComponent />);
    });

    expect(screen.getByTestId('loading').textContent).toBe('false');
    expect(screen.getByTestId('session').textContent).toBe('null');
    expect(screen.getByTestId('error').textContent).toBe('null');
  });

  it('handles error from getSession', async () => {
    const fakeError: AuthError = { message: 'Auth failed' };
    (supabase.auth.getSession as jest.Mock).mockRejectedValue(fakeError);
    (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation((_cb: any) => ({ data: { subscription: { unsubscribe: jest.fn() } } }));

    await act(async () => {
      render(<TestComponent />);
    });

    expect(screen.getByTestId('loading').textContent).toBe('false');
    expect(screen.getByTestId('session').textContent).toBe('null');
    expect(screen.getByTestId('error').textContent).toBe('Auth failed');
  });

  it('updates session on auth state change', async () => {
    let authCallback: any;
    const fakeSession: Session = { user: { id: 'user-456' } };
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({ data: { session: null } });
    (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation((cb: any) => {
      authCallback = cb;
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    });

    await act(async () => {
      render(<TestComponent />);
    });

    // Simulate auth state change
    await act(async () => {
      authCallback('SIGNED_IN', fakeSession);
    });

    expect(screen.getByTestId('session').textContent).toBe('user-456');
  });

  it('cleans up subscription on unmount', async () => {
    const unsubscribe = jest.fn();
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({ data: { session: null } });
    (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation((_cb: any) => ({ data: { subscription: { unsubscribe } } }));

    let unmount: () => void;
    await act(async () => {
      const result = render(<TestComponent />);
      unmount = result.unmount;
    });

    await act(async () => {
      unmount();
    });

    expect(unsubscribe).toHaveBeenCalled();
  });
}); 