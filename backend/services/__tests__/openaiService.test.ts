import { OpenAIService } from '../openaiService';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

// Helper to create a mock OpenAI client for DI
function createMockOpenAI(overrides: any = {}) {
  return {
    responses: {
      create: jest.fn(),
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
    createMock = mockOpenAI.responses.create;
    jest.clearAllMocks();
  });

  it('returns content on successful completion', async () => {
    // Mock the Responses API result
    createMock.mockResolvedValue({
      output_text: 'Hello world!',
    });
    
    const messages: ChatCompletionMessageParam[] = [
      { role: 'user', content: 'Say hello' },
    ];
    
    const result = await service.callOpenAI(messages);
    
    expect(result).toBe('Hello world!');
    expect(createMock).toHaveBeenCalledWith({
      model: defaultModel,
      input: messages,
    });
  });

  it('throws if Responses API returns invalid content', async () => {
    createMock.mockResolvedValue({
      // No output_text property
    });
    
    await expect(
      service.callOpenAI([{ role: 'user', content: 'Say hello' }])
    ).rejects.toThrow('OpenAI API returned invalid or no content.');
  });

  it('throws if Responses API returns null', async () => {
    createMock.mockResolvedValue(null);
    
    await expect(
      service.callOpenAI([{ role: 'user', content: 'Say hello' }])
    ).rejects.toThrow('OpenAI API returned invalid or no content.');
  });

  it('throws if OpenAI API throws', async () => {
    createMock.mockRejectedValue(new Error('API failure'));
    
    await expect(
      service.callOpenAI([{ role: 'user', content: 'Say hello' }])
    ).rejects.toThrow('OpenAI API Error: API failure');
  });

  it('uses the provided model if specified', async () => {
    createMock.mockResolvedValue({
      output_text: 'Hi!',
    });
    
    const messages: ChatCompletionMessageParam[] = [
      { role: 'user', content: 'Say hi' },
    ];
    
    const result = await service.callOpenAI(
      messages,
      123, // maxTokens (ignored by Responses API)
      'gpt-3.5-turbo'
    );
    
    expect(result).toBe('Hi!');
    expect(createMock).toHaveBeenCalledWith({
      model: 'gpt-3.5-turbo',
      input: messages,
    });
  });

  it('uses the default model if model is not specified', async () => {
    createMock.mockResolvedValue({
      output_text: 'Default model!',
    });
    
    const messages: ChatCompletionMessageParam[] = [
      { role: 'user', content: 'Say something' },
    ];
    
    const result = await service.callOpenAI(
      messages,
      222 // maxTokens (ignored by Responses API)
    );
    
    expect(result).toBe('Default model!');
    expect(createMock).toHaveBeenCalledWith({
      model: defaultModel,
      input: messages,
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
      const messages: ChatCompletionMessageParam[] = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say hello' },
      ];
      
      await service.streamChatCompletion(messages, onData);
      
      expect(mockOpenAI.responses.stream).toHaveBeenCalledWith({
        model: defaultModel,
        input: messages,
      });
      expect(onData).toHaveBeenCalledWith('Hello');
      expect(onData).toHaveBeenCalledWith(' world');
    });

    it('throws if the stream throws', async () => {
      mockOpenAI.responses.stream.mockImplementation(() => { 
        throw new Error('stream fail'); 
      });
      
      const onData = jest.fn();
      const messages: ChatCompletionMessageParam[] = [
        { role: 'user', content: 'Say hello' },
      ];
      
      await expect(
        service.streamChatCompletion(messages, onData)
      ).rejects.toThrow('OpenAI API Error (stream): stream fail');
    });
  });
}); 