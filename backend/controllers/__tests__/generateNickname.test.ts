import { generateNickname } from "../analyzeController";
import { OpenAIService } from "../../services/openaiService";

describe("generateNickname", () => {
  it("returns trimmed nickname from OpenAI", async () => {
    const mockOpenai = {
      callOpenAI: jest.fn().mockResolvedValue("Cool Nickname\n"),
    } as unknown as OpenAIService;
    const result = await generateNickname("Hello world", mockOpenai);
    expect(result).toBe("Cool Nickname");
    expect(mockOpenai.callOpenAI).toHaveBeenCalled();
  });

  it("returns default nickname if OpenAI returns empty", async () => {
    const mockOpenai = {
      callOpenAI: jest.fn().mockResolvedValue("   "),
    } as unknown as OpenAIService;
    const result = await generateNickname("Hello world", mockOpenai);
    expect(result).toBe("Chat Pal");
  });

  it("returns name plus descriptors if present in the LLM response", async () => {
    const mockOpenai = {
      callOpenAI: jest.fn().mockResolvedValue("Anna Bright Eyes"),
    } as unknown as OpenAIService;
    const result = await generateNickname(
      "Her name is Anna and she has bright eyes.",
      mockOpenai
    );
    expect(result).toBe("Anna Bright Eyes");
  });

  it("returns just descriptors if no name is present in the LLM response", async () => {
    const mockOpenai = {
      callOpenAI: jest.fn().mockResolvedValue("Adventurous Spirit"),
    } as unknown as OpenAIService;
    const result = await generateNickname(
      "A girl who loves to travel and explore.",
      mockOpenai
    );
    expect(result).toBe("Adventurous Spirit");
  });

  it("handles edge case: LLM returns only whitespace", async () => {
    const mockOpenai = {
      callOpenAI: jest.fn().mockResolvedValue("   "),
    } as unknown as OpenAIService;
    const result = await generateNickname("No info", mockOpenai);
    expect(result).toBe("Chat Pal");
  });

  it("strips double quotes from nickname response", async () => {
    const mockOpenai = {
      callOpenAI: jest.fn().mockResolvedValue('"SparkleLocks"'),
    } as unknown as OpenAIService;
    const result = await generateNickname(
      "Her name is Sarah and she has sparkly curly hair.",
      mockOpenai
    );
    expect(result).toBe("SparkleLocks");
  });

  it("strips single quotes from nickname response", async () => {
    const mockOpenai = {
      callOpenAI: jest.fn().mockResolvedValue("'BrightEyes'"),
    } as unknown as OpenAIService;
    const result = await generateNickname(
      "She has very bright eyes.",
      mockOpenai
    );
    expect(result).toBe("BrightEyes");
  });

  it("handles nicknames with quotes inside but not surrounding", async () => {
    const mockOpenai = {
      callOpenAI: jest.fn().mockResolvedValue('Smart "Cookie" Girl'),
    } as unknown as OpenAIService;
    const result = await generateNickname(
      "A smart girl who loves cookies.",
      mockOpenai
    );
    expect(result).toBe('Smart "Cookie" Girl');
  });

  it("handles empty quotes", async () => {
    const mockOpenai = {
      callOpenAI: jest.fn().mockResolvedValue('""'),
    } as unknown as OpenAIService;
    const result = await generateNickname("Hello world", mockOpenai);
    expect(result).toBe("Chat Pal");
  });
});
