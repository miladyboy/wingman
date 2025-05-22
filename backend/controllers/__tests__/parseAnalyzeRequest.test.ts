import { parseAnalyzeRequest } from '../analyzeController';

describe('parseAnalyzeRequest', () => {
  it('parses valid historyJson', () => {
    const req = {
      body: {
        historyJson: '[{"role":"user","content":"hi"}]',
        newMessageText: 'hello',
        conversationId: 'abc',
        isDraft: false,
        stage: 'TestStage'
      },
      files: [{ name: 'file1.png' }]
    } as any;
    expect(parseAnalyzeRequest(req)).toEqual({
      history: [{ role: 'user', content: 'hi' }],
      newMessageText: 'hello',
      conversationId: 'abc',
      files: [{ name: 'file1.png' }],
      isDraft: false,
      stage: 'TestStage'
    });
  });

  it('returns empty history if historyJson is missing', () => {
    const req = {
      body: {
        newMessageText: 'hello',
        conversationId: 'abc',
        isDraft: true,
        stage: 'TestStage'
      },
      files: []
    } as any;
    expect(parseAnalyzeRequest(req)).toEqual({
      history: [],
      newMessageText: 'hello',
      conversationId: 'abc',
      files: [],
      isDraft: true,
      stage: 'TestStage'
    });
  });

  it('throws on invalid historyJson', () => {
    const req = {
      body: {
        historyJson: 'not json',
        newMessageText: 'hello',
        conversationId: 'abc',
        isDraft: false,
        stage: 'TestStage'
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
        isDraft: false,
        stage: 'TestStage'
      }
      // files is undefined
    } as any;
    expect(parseAnalyzeRequest(req)).toEqual({
      history: [{ role: 'user', content: 'hi' }],
      newMessageText: 'hello',
      conversationId: 'abc',
      files: [],
      isDraft: false,
      stage: 'TestStage'
    });
  });

  it('throws if newMessageText is missing', () => {
    const req = {
      body: {
        conversationId: 'abc',
        isDraft: false,
        stage: 'TestStage'
      },
      files: []
    } as any;
    expect(() => parseAnalyzeRequest(req)).toThrow('newMessageText, conversationId, isDraft, and stage are required');
  });

  it('throws if conversationId is missing', () => {
    const req = {
      body: {
        newMessageText: 'hello',
        isDraft: false,
        stage: 'TestStage'
      },
      files: []
    } as any;
    expect(() => parseAnalyzeRequest(req)).toThrow('newMessageText, conversationId, isDraft, and stage are required');
  });

  it('throws if both newMessageText and conversationId are missing', () => {
    const req = {
      body: {
        isDraft: false,
        stage: 'TestStage'
      },
      files: []
    } as any;
    expect(() => parseAnalyzeRequest(req)).toThrow('newMessageText, conversationId, isDraft, and stage are required');
  });

  it('throws if req is completely empty', () => {
    const req = {} as any;
    expect(() => parseAnalyzeRequest(req)).toThrow();
  });
}); 