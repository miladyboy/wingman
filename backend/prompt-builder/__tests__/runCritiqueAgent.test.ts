import { PromptInput, IntentMode, Stage } from "../types";
import type { SimpPreference } from "../../types/user";

const mockBuildSystemPrompt = jest.fn(() => "SYSTEM_PROMPT");
const mockBuildUserPrompt = jest.fn(() => "USER_PROMPT");

jest.mock("../buildSystemPrompt", () => ({
  buildSystemPrompt: mockBuildSystemPrompt,
}));
jest.mock("../buildUserPrompt", () => ({
  buildUserPrompt: mockBuildUserPrompt,
}));

const makeOpenAIClient = (reply: string) => ({
  chat: {
    completions: {
      create: jest.fn().mockResolvedValue({
        choices: [{ message: { content: reply } }],
      }),
    },
  },
});

describe("runCritiqueAgent", () => {
  const input: PromptInput = {
    intent: "NewSuggestions" as IntentMode,
    stage: "Opening" as Stage,
    userPreferences: "Likes cats",
    latestMessage: "Hi!",
    simpPreference: "auto" as SimpPreference,
  };
  const originalReply = "Original AI reply.";

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it("parses a well-formatted critique and final reply", async () => {
    const reply = "[CRITIQUE]: No issues\n[FINAL REPLY]: Improved reply!";
    const client = makeOpenAIClient(reply);
    const { runCritiqueAgent } = await import("../runCritiqueAgent");
    const result = await runCritiqueAgent(input, originalReply, client as any);
    expect(result.critique).toContain("No issues");
    expect(result.finalReply).toBe("Improved reply!");
  });

  it("handles missing [FINAL REPLY] section", async () => {
    const reply = "[CRITIQUE]: Some critique only.";
    const client = makeOpenAIClient(reply);
    const { runCritiqueAgent } = await import("../runCritiqueAgent");
    const result = await runCritiqueAgent(input, originalReply, client as any);
    expect(result.critique).toContain("Format error");
    expect(result.finalReply).toBe(originalReply);
  });

  it("handles missing [CRITIQUE] section", async () => {
    const reply = "[FINAL REPLY]: Only reply.";
    const client = makeOpenAIClient(reply);
    const { runCritiqueAgent } = await import("../runCritiqueAgent");
    const result = await runCritiqueAgent(input, originalReply, client as any);
    expect(result.critique).toContain("Format error");
    expect(result.finalReply).toBe(originalReply);
  });

  it("handles completely unformatted response", async () => {
    const reply = "Just some text.";
    const client = makeOpenAIClient(reply);
    const { runCritiqueAgent } = await import("../runCritiqueAgent");
    const result = await runCritiqueAgent(input, originalReply, client as any);
    expect(result.critique).toContain("Format error");
    expect(result.finalReply).toBe(originalReply);
  });

  it("handles empty [FINAL REPLY] section", async () => {
    const reply = "[CRITIQUE]: Fine\n[FINAL REPLY]:   ";
    const client = makeOpenAIClient(reply);
    const { runCritiqueAgent } = await import("../runCritiqueAgent");
    const result = await runCritiqueAgent(input, originalReply, client as any);
    expect(result.critique).toContain("WARNING");
    expect(result.finalReply).toBe(originalReply);
  });
});
