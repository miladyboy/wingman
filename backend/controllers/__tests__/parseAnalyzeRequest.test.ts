import { parseAnalyzeRequest } from '../analyzeController';

describe('parseAnalyzeRequest', () => {
  it('parses valid historyJson', () => {
    const req = {
      body: {
        historyJson: '[{"role":"user","content":"hi"}]',
        newMessageText: 'hello',
        conversationId: 'abc'
      },
      files: [{ name: 'file1.png' }]
    } as any;
    expect(parseAnalyzeRequest(req)).toEqual({
      history: [{ role: 'user', content: 'hi' }],
      newMessageText: 'hello',
      conversationId: 'abc',
      files: [{ name: 'file1.png' }]
    });
  });

  it('returns empty history if historyJson is missing', () => {
    const req = {
      body: {
        newMessageText: 'hello',
        conversationId: 'abc'
      },
      files: []
    } as any;
    expect(parseAnalyzeRequest(req)).toEqual({
      history: [],
      newMessageText: 'hello',
      conversationId: 'abc',
      files: []
    });
  });

  it('throws on invalid historyJson', () => {
    const req = {
      body: {
        historyJson: 'not json',
        newMessageText: 'hello',
        conversationId: 'abc'
      },
      files: []
    } as any;
    expect(() => parseAnalyzeRequest(req)).toThrow('Invalid history JSON');
  });

  it('returns empty files if files is missing', () => {
    const req = {
      body: {
        historyJson: '[{"role":"user","content":"hi"}]',
        newMessageText: 'hello',
        conversationId: 'abc'
      }
      // files is undefined
    } as any;
    expect(parseAnalyzeRequest(req)).toEqual({
      history: [{ role: 'user', content: 'hi' }],
      newMessageText: 'hello',
      conversationId: 'abc',
      files: []
    });
  });

  it('handles empty req.body gracefully', () => {
    const req = {
      body: {},
      files: []
    } as any;
    expect(parseAnalyzeRequest(req)).toEqual({
      history: [],
      newMessageText: undefined,
      conversationId: undefined,
      files: []
    });
  });

  it('handles completely empty req', () => {
    const req = {} as any;
    expect(parseAnalyzeRequest(req)).toEqual({
      history: [],
      newMessageText: undefined,
      conversationId: undefined,
      files: []
    });
  });
}); 