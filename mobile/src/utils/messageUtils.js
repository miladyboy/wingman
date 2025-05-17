export function buildOptimisticUserMessage(text) {
  return {
    id: `user-${Date.now()}`,
    sender: 'user',
    content: text,
    optimistic: true,
  };
}

export function serializeMessageHistory(messages) {
  return JSON.stringify(
    messages.map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.content,
    }))
  );
}
