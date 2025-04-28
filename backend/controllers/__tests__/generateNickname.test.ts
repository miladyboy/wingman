import { generateNickname } from '../analyzeController';
import { OpenAIService } from '../../services/openaiService';

describe('generateNickname', () => {
  it('returns trimmed nickname from OpenAI', async () => {
    const mockOpenai = { callOpenAI: jest.fn().mockResolvedValue('Cool Nickname\n') } as unknown as OpenAIService;
    const result = await generateNickname('Hello world', mockOpenai);
    expect(result).toBe('Cool Nickname');
    expect(mockOpenai.callOpenAI).toHaveBeenCalled();
  });

  it('returns default nickname if OpenAI returns empty', async () => {
    const mockOpenai = { callOpenAI: jest.fn().mockResolvedValue('   ') } as unknown as OpenAIService;
    const result = await generateNickname('Hello world', mockOpenai);
    expect(result).toBe('Chat Pal');
  });
}); 