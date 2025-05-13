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

  it('returns name plus descriptors if present in the LLM response', async () => {
    const mockOpenai = { callOpenAI: jest.fn().mockResolvedValue('Anna Bright Eyes') } as unknown as OpenAIService;
    const result = await generateNickname('Her name is Anna and she has bright eyes.', mockOpenai);
    expect(result).toBe('Anna Bright Eyes');
  });

  it('returns just descriptors if no name is present in the LLM response', async () => {
    const mockOpenai = { callOpenAI: jest.fn().mockResolvedValue('Adventurous Spirit') } as unknown as OpenAIService;
    const result = await generateNickname('A girl who loves to travel and explore.', mockOpenai);
    expect(result).toBe('Adventurous Spirit');
  });

  it('handles edge case: LLM returns only whitespace', async () => {
    const mockOpenai = { callOpenAI: jest.fn().mockResolvedValue('   ') } as unknown as OpenAIService;
    const result = await generateNickname('No info', mockOpenai);
    expect(result).toBe('Chat Pal');
  });
}); 