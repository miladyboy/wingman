import { OpenAIService } from '../openaiService';

// Properly mock the OpenAI class as a constructor, defined inside the jest.mock factory
jest.mock('openai', () => {
  class OpenAIMock {
    chat = {
      completions: {
        create: jest.fn(),
      },
    };
  }
  return {
    __esModule: true,
    default: OpenAIMock,
  };
});

describe('OpenAIService', () => {
  const apiKey = 'test-api-key';
  const defaultModel = 'gpt-4o';
  let service: OpenAIService;
  let createMock: jest.Mock;

  beforeEach(() => {
    service = new OpenAIService(apiKey, defaultModel);
    createMock = (service as any).openai.chat.completions.create;
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
}); 