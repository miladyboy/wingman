import { renderHook, act, waitFor } from '@testing-library/react';
import useActiveConversationId from './useActiveConversationId';

// Inline types for test only
interface Conversation {
  id: string;
  name: string;
}
interface Session {
  user: { id: string };
}

function createMockStorage() {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
}

describe('useActiveConversationId', () => {
  const conversations: Conversation[] = [
    { id: 'c1', name: 'Chat 1' },
    { id: 'c2', name: 'Chat 2' },
  ];
  const session: Session = { user: { id: 'u1' } };
  const storageKey = 'harem:lastActiveChatId';

  let mockStorage: ReturnType<typeof createMockStorage>;

  beforeEach(() => {
    mockStorage = createMockStorage();
    mockStorage.clear();
  });

  function hookWrapper({ conversations, session, storage }: { conversations: Conversation[]; session: Session | null; storage: any }) {
    return useActiveConversationId(conversations, session, { storage });
  }

  it('returns null initially if no conversations or session', () => {
    const { result } = renderHook(hookWrapper, {
      initialProps: { conversations: [], session: null, storage: mockStorage },
    });
    expect(result.current.activeConversationId).toBe(null);
  });

  it('restores last active conversation from storage if valid', async () => {
    mockStorage.setItem(storageKey, 'c2');
    const { result } = renderHook(hookWrapper, {
      initialProps: { conversations, session, storage: mockStorage },
    });
    await waitFor(() => {
      expect(result.current.activeConversationId).toBe('c2');
    });
  });

  it('falls back to first conversation if storage value is invalid', async () => {
    mockStorage.setItem(storageKey, 'invalid');
    const { result } = renderHook(hookWrapper, {
      initialProps: { conversations, session, storage: mockStorage },
    });
    await waitFor(() => {
      expect(result.current.activeConversationId).toBe('c1');
    });
  });

  it('falls back to first conversation if storage is empty', async () => {
    const { result } = renderHook(hookWrapper, {
      initialProps: { conversations, session, storage: mockStorage },
    });
    await waitFor(() => {
      expect(result.current.activeConversationId).toBe('c1');
    });
  });

  it('setActiveConversationId updates state and storage', async () => {
    const { result } = renderHook(hookWrapper, {
      initialProps: { conversations, session, storage: mockStorage },
    });
    act(() => {
      result.current.setActiveConversationId('c2');
    });
    await waitFor(() => {
      expect(result.current.activeConversationId).toBe('c2');
      expect(mockStorage.getItem(storageKey)).toBe('c2');
    });
  });

  it('setActiveConversationId(null) removes from storage', async () => {
    mockStorage.setItem(storageKey, 'c1');
    const { result } = renderHook(hookWrapper, {
      initialProps: { conversations, session, storage: mockStorage },
    });
    act(() => {
      result.current.setActiveConversationId(null);
    });
    await waitFor(() => {
      expect(result.current.activeConversationId).toBe('c1');
      expect(mockStorage.getItem(storageKey)).toBe('c1');
    });
  });

  it('reacts to session change (restores again)', async () => {
    mockStorage.setItem(storageKey, 'c2');
    let props = { conversations, session: null as Session | null, storage: mockStorage };
    const { result, rerender } = renderHook(hookWrapper, { initialProps: props });
    await waitFor(() => {
      expect(result.current.activeConversationId).toBe(null);
    });
    props = { ...props, session };
    rerender(props);
    await waitFor(() => {
      expect(result.current.activeConversationId).toBe('c2');
    });
  });

  it('SSR safety: does not throw if storage is undefined', () => {
    expect(() => {
      renderHook(hookWrapper, {
        initialProps: { conversations, session, storage: undefined },
      });
    }).not.toThrow();
  });
}); 