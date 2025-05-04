import { OpenAIService } from '../openaiService';

// Helper to create a mock OpenAI client for DI
function createMockOpenAI(overrides: any = {}) {
  return {
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
    responses: {
      stream: jest.fn(),
    },
    ...overrides,
  };
}

describe('OpenAIService', () => {
  const apiKey = 'test-api-key';
  const defaultModel = 'gpt-4o';
  let service: OpenAIService;
  let createMock: jest.Mock;
  let mockOpenAI: any;

  beforeEach(() => {
    mockOpenAI = createMockOpenAI();
    service = new OpenAIService(apiKey, defaultModel, mockOpenAI);
    createMock = mockOpenAI.chat.completions.create;
    jest.clearAllMocks();
  });

  it('returns content on successful completion', async () => {
    createMock.mockResolvedValue({
      choices: [
        { message: { content: 'Hello world!' } },
      ],
    });
    const result = await service.callOpenAI([
      { role: 'user', content: 'Say hello' },
    ]);
    expect(result).toBe('Hello world!');
    expect(createMock).toHaveBeenCalledWith({
      model: defaultModel,
      messages: [{ role: 'user', content: 'Say hello' }],
      max_tokens: 500,
    });
  });

  it('throws if OpenAI returns null content', async () => {
    createMock.mockResolvedValue({
      choices: [
        { message: { content: null } },
      ],
    });
    await expect(
      service.callOpenAI([{ role: 'user', content: 'Say hello' }])
    ).rejects.toThrow('OpenAI API returned a null message content.');
  });

  it('throws if OpenAI returns empty choices', async () => {
    createMock.mockResolvedValue({ choices: [] });
    await expect(
      service.callOpenAI([{ role: 'user', content: 'Say hello' }])
    ).rejects.toThrow('OpenAI API returned no choices.');
  });

  it('throws if OpenAI returns malformed response', async () => {
    createMock.mockResolvedValue({});
    await expect(
      service.callOpenAI([{ role: 'user', content: 'Say hello' }])
    ).rejects.toThrow('OpenAI API returned no choices.');
  });

  it('throws if OpenAI API throws', async () => {
    createMock.mockRejectedValue(new Error('API failure'));
    await expect(
      service.callOpenAI([{ role: 'user', content: 'Say hello' }])
    ).rejects.toThrow('OpenAI API Error: API failure');
  });

  it('uses the provided model if specified', async () => {
    createMock.mockResolvedValue({
      choices: [
        { message: { content: 'Hi!' } },
      ],
    });
    const result = await service.callOpenAI(
      [{ role: 'user', content: 'Say hi' }],
      123,
      'gpt-3.5-turbo'
    );
    expect(result).toBe('Hi!');
    expect(createMock).toHaveBeenCalledWith({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Say hi' }],
      max_tokens: 123,
    });
  });

  it('uses the default model if model is not specified', async () => {
    createMock.mockResolvedValue({
      choices: [
        { message: { content: 'Default model!' } },
      ],
    });
    const result = await service.callOpenAI(
      [{ role: 'user', content: 'Say something' }],
      222
    );
    expect(result).toBe('Default model!');
    expect(createMock).toHaveBeenCalledWith({
      model: defaultModel,
      messages: [{ role: 'user', content: 'Say something' }],
      max_tokens: 222,
    });
  });

  describe('streamChatCompletion', () => {
    it('calls onData for each streamed chunk', async () => {
      // Mock the OpenAI streaming generator
      async function* mockStream() {
        yield { type: 'response.output_text.delta', delta: 'Hello' };
        yield { type: 'response.output_text.delta', delta: ' world' };
      }
      mockOpenAI.responses.stream.mockReturnValue(mockStream());
      const onData = jest.fn();
      await service.streamChatCompletion('prompt', onData);
      expect(onData).toHaveBeenCalledWith('Hello');
      expect(onData).toHaveBeenCalledWith(' world');
    });

    it('throws if the stream throws', async () => {
      mockOpenAI.responses.stream.mockImplementation(() => { throw new Error('stream fail'); });
      const onData = jest.fn();
      await expect(service.streamChatCompletion('prompt', onData)).rejects.toThrow('OpenAI API Error (stream): stream fail');
    });
  });
}); 