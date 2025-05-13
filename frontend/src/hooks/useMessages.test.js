import { reconcileMessages } from './useMessages';

describe('reconcileMessages', () => {
  it('removes optimistic message if backend message matches by sender, content, and image count', () => {
    const serverMessages = [
      { sender: 'user', content: 'Hello', imageUrls: ['img1'] },
    ];
    const optimisticMessages = [
      { sender: 'user', content: 'Hello', imageUrls: ['img1'], optimistic: true },
    ];
    const result = reconcileMessages(serverMessages, optimisticMessages);
    expect(result).toEqual(serverMessages);
  });

  it('keeps optimistic message if backend message matches by sender and content but has fewer images', () => {
    const serverMessages = [
      { sender: 'user', content: 'Hello', imageUrls: [] },
    ];
    const optimisticMessages = [
      { sender: 'user', content: 'Hello', imageUrls: ['img1'], optimistic: true },
    ];
    const result = reconcileMessages(serverMessages, optimisticMessages);
    expect(result).toEqual(optimisticMessages);
  });

  it('removes optimistic message if backend message matches by sender and content and has more images', () => {
    const serverMessages = [
      { sender: 'user', content: 'Hello', imageUrls: ['img1', 'img2'] },
    ];
    const optimisticMessages = [
      { sender: 'user', content: 'Hello', imageUrls: ['img1'], optimistic: true },
    ];
    const result = reconcileMessages(serverMessages, optimisticMessages);
    expect(result).toEqual(serverMessages);
  });

  it('keeps both if messages are different', () => {
    const serverMessages = [
      { sender: 'user', content: 'Hello', imageUrls: [] },
    ];
    const optimisticMessages = [
      { sender: 'user', content: 'Hi', imageUrls: ['img1'], optimistic: true },
    ];
    const result = reconcileMessages(serverMessages, optimisticMessages);
    expect(result).toEqual([...serverMessages, ...optimisticMessages]);
  });
}); 