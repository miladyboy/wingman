import { parseAnalyzeRequest } from "../analyzeController";

describe("parseAnalyzeRequest", () => {
  it("parses valid historyJson", () => {
    const req = {
      body: {
        historyJson: '[{"role":"user","content":"hi"}]',
        newMessageText: "hello",
        conversationId: "abc",
        isDraft: false,
        stage: "Opening",
      },
      files: [{ name: "file1.png" }],
    } as any;
    expect(parseAnalyzeRequest(req)).toEqual({
      history: [{ role: "user", content: "hi" }],
      newMessageText: "hello",
      conversationId: "abc",
      files: [{ name: "file1.png" }],
      isDraft: false,
      stage: "Opening",
    });
  });

  it("returns empty history if historyJson is missing", () => {
    const req = {
      body: {
        newMessageText: "hello",
        conversationId: "abc",
        isDraft: true,
        stage: "Continue",
      },
      files: [],
    } as any;
    expect(parseAnalyzeRequest(req)).toEqual({
      history: [],
      newMessageText: "hello",
      conversationId: "abc",
      files: [],
      isDraft: true,
      stage: "Continue",
    });
  });

  it("throws on invalid historyJson", () => {
    const req = {
      body: {
        historyJson: "not json",
        newMessageText: "hello",
        conversationId: "abc",
        isDraft: false,
        stage: "Opening",
      },
      files: [],
    } as any;
    expect(() => parseAnalyzeRequest(req)).toThrow("Invalid history JSON");
  });

  it("returns empty files if files is missing", () => {
    const req = {
      body: {
        historyJson: '[{"role":"user","content":"hi"}]',
        newMessageText: "hello",
        conversationId: "abc",
        isDraft: false,
        stage: "ReEngage",
      },
      // files is undefined
    } as any;
    expect(parseAnalyzeRequest(req)).toEqual({
      history: [{ role: "user", content: "hi" }],
      newMessageText: "hello",
      conversationId: "abc",
      files: [],
      isDraft: false,
      stage: "ReEngage",
    });
  });

  it("throws if newMessageText is missing", () => {
    const req = {
      body: {
        conversationId: "abc",
        isDraft: false,
        stage: "Opening",
      },
      files: [],
    } as any;
    expect(() => parseAnalyzeRequest(req)).toThrow(
      "newMessageText, conversationId, and isDraft are required"
    );
  });

  it("throws if conversationId is missing", () => {
    const req = {
      body: {
        newMessageText: "hello",
        isDraft: false,
        stage: "Continue",
      },
      files: [],
    } as any;
    expect(() => parseAnalyzeRequest(req)).toThrow(
      "newMessageText, conversationId, and isDraft are required"
    );
  });

  it("throws if both newMessageText and conversationId are missing", () => {
    const req = {
      body: {
        isDraft: false,
        stage: "ReEngage",
      },
      files: [],
    } as any;
    expect(() => parseAnalyzeRequest(req)).toThrow(
      "newMessageText, conversationId, and isDraft are required"
    );
  });

  it("throws if req is completely empty", () => {
    const req = {} as any;
    expect(() => parseAnalyzeRequest(req)).toThrow();
  });

  it("throws if stage is invalid", () => {
    const req = {
      body: {
        newMessageText: "hello",
        conversationId: "abc",
        isDraft: false,
        stage: "InvalidStage",
      },
      files: [],
    } as any;
    expect(() => parseAnalyzeRequest(req)).toThrow(
      "stage must be one of: Opening, Continue, ReEngage"
    );
  });

  it("infers stage as 'Opening' when stage is not provided and history is empty", () => {
    const req = {
      body: {
        newMessageText: "hello",
        conversationId: "abc",
        isDraft: false,
        // stage is not provided
      },
      files: [],
    } as any;
    expect(parseAnalyzeRequest(req)).toEqual({
      history: [],
      newMessageText: "hello",
      conversationId: "abc",
      files: [],
      isDraft: false,
      stage: "Opening",
    });
  });

  it("infers stage as 'Continue' when stage is not provided and isDraft is true", () => {
    const req = {
      body: {
        historyJson: '[{"role":"user","content":"hi"}]',
        newMessageText: "hello",
        conversationId: "abc",
        isDraft: true,
        // stage is not provided
      },
      files: [],
    } as any;
    expect(parseAnalyzeRequest(req)).toEqual({
      history: [{ role: "user", content: "hi" }],
      newMessageText: "hello",
      conversationId: "abc",
      files: [],
      isDraft: true,
      stage: "Continue",
    });
  });

  it("infers stage as 'ReEngage' when stage is not provided and last message is from user", () => {
    const req = {
      body: {
        historyJson:
          '[{"role":"user","content":"hi"}, {"role":"assistant","content":"hello"}, {"role":"user","content":"how are you?"}]',
        newMessageText: "hello again",
        conversationId: "abc",
        isDraft: false,
        // stage is not provided
      },
      files: [],
    } as any;
    expect(parseAnalyzeRequest(req)).toEqual({
      history: [
        { role: "user", content: "hi" },
        { role: "assistant", content: "hello" },
        { role: "user", content: "how are you?" },
      ],
      newMessageText: "hello again",
      conversationId: "abc",
      files: [],
      isDraft: false,
      stage: "ReEngage",
    });
  });

  it("infers stage as 'Continue' when stage is not provided and last message is from assistant", () => {
    const req = {
      body: {
        historyJson:
          '[{"role":"user","content":"hi"}, {"role":"assistant","content":"hello"}]',
        newMessageText: "how are you?",
        conversationId: "abc",
        isDraft: false,
        // stage is not provided
      },
      files: [],
    } as any;
    expect(parseAnalyzeRequest(req)).toEqual({
      history: [
        { role: "user", content: "hi" },
        { role: "assistant", content: "hello" },
      ],
      newMessageText: "how are you?",
      conversationId: "abc",
      files: [],
      isDraft: false,
      stage: "Continue",
    });
  });
});
