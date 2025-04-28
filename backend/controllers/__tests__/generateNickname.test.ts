import { generateNickname } from '../analyzeController';

jest.mock('../../services/openaiService', () => ({
  callOpenAI: jest.fn()
}));
import { callOpenAI } from '../../services/openaiService';

describe('generateNickname', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns trimmed nickname from OpenAI', async () => {
    (callOpenAI as jest.Mock).mockResolvedValue('Cool Nickname\n');
    const result = await generateNickname('Hello world');
    expect(result).toBe('Cool Nickname');
    expect(callOpenAI).toHaveBeenCalled();
  });

  it('returns default nickname if OpenAI returns empty', async () => {
    (callOpenAI as jest.Mock).mockResolvedValue('   ');
    const result = await generateNickname('Hello world');
    expect(result).toBe('Chat Pal');
  });
}); 