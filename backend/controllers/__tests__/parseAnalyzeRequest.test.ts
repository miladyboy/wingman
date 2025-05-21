import { parseAnalyzeRequest } from '../analyzeController';

describe('parseAnalyzeRequest', () => {
  it('parses valid historyJson', () => {
    const req = {
      body: {
        historyJson: '[{"role":"user","content":"hi"}]',
        newMessageText: 'hello',
        conversationId: 'abc',
        intent: 'TestIntent',
        stage: 'TestStage'
      },
      files: [{ name: 'file1.png' }]
    } as any;
    expect(parseAnalyzeRequest(req)).toEqual({
      history: [{ role: 'user', content: 'hi' }],
      newMessageText: 'hello',
      conversationId: 'abc',
      files: [{ name: 'file1.png' }],
      intent: 'TestIntent',
      stage: 'TestStage'
    });
  });

  it('returns empty history if historyJson is missing', () => {
    const req = {
      body: {
        newMessageText: 'hello',
        conversationId: 'abc',
        intent: 'TestIntent',
        stage: 'TestStage'
      },
      files: []
    } as any;
    expect(parseAnalyzeRequest(req)).toEqual({
      history: [],
      newMessageText: 'hello',
      conversationId: 'abc',
      files: [],
      intent: 'TestIntent',
      stage: 'TestStage'
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
        conversationId: 'abc',
        intent: 'TestIntent',
        stage: 'TestStage'
      }
      // files is undefined
    } as any;
    expect(parseAnalyzeRequest(req)).toEqual({
      history: [{ role: 'user', content: 'hi' }],
      newMessageText: 'hello',
      conversationId: 'abc',
      files: [],
      intent: 'TestIntent',
      stage: 'TestStage'
    });
  });

  it('throws if newMessageText is missing', () => {
    const req = {
      body: {
        conversationId: 'abc'
      },
      files: []
    } as any;
    expect(() => parseAnalyzeRequest(req)).toThrow('newMessageText, conversationId, intent, and stage are required');
  });

  it('throws if conversationId is missing', () => {
    const req = {
      body: {
        newMessageText: 'hello'
      },
      files: []
    } as any;
    expect(() => parseAnalyzeRequest(req)).toThrow('newMessageText, conversationId, intent, and stage are required');
  });

  it('throws if both newMessageText and conversationId are missing', () => {
    const req = {
      body: {},
      files: []
    } as any;
    expect(() => parseAnalyzeRequest(req)).toThrow('newMessageText, conversationId, intent, and stage are required');
  });

  it('throws if req is completely empty', () => {
    const req = {} as any;
    expect(() => parseAnalyzeRequest(req)).toThrow();
  });
}); 