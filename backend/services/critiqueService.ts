/**
 * @fileoverview Service functions for running the Critique Agent on AI-generated replies.
 *
 * Provides the main entry point for executing the critique process, which reviews and optionally revises
 * LLM-generated flirting assistant responses for tone, ethics, personalization, and quality. Handles prompt
 * construction, OpenAI API calls, and robust parsing of critique results.
 *
 * Exports:
 * - runCritiqueAgent: Executes the critique workflow and returns both the critique and the (possibly revised) reply.
 *
 * Usage:
 *   import { runCritiqueAgent } from "./critiqueService";
 *
 * See also: ../prompts/critiquePrompt.ts for the system prompt definition.
 */
import { OpenAI } from "openai";
import { PromptInput } from "../types/prompt";
import { PromptService } from "./promptService";
import { critiquePrompt } from "../prompts/critiquePrompt";

/**
 * Executes the Critique Agent to review and optionally fix the LLM reply.
 * Returns both the critique text and the final reply (may be unchanged).
 */
export async function runCritiqueAgent(
  input: PromptInput,
  originalReply: string,
  openaiClient: OpenAI
): Promise<{ critique: string; finalReply: string }> {
  // Re-use PromptService to reconstruct the same system & user blocks the model saw
  const messagesArr = PromptService.buildMainPrompt(input);
  const system =
    (messagesArr.find((m) => m.role === "system")?.content as string) ?? "";
  const user =
    (messagesArr.find((m) => m.role === "user")?.content as string) ?? "";

  const critiqueUserPrompt =
    `\n=== SYSTEM RULES ===\n${system}\n\n=== USER INPUT ===\n${user}\n\n=== AI-GENERATED REPLY ===\n${originalReply}`.trim();

  const res = await openaiClient.chat.completions.create({
    messages: [critiquePrompt(), { role: "user", content: critiqueUserPrompt }],
    model: "gpt-4",
    temperature: 0.3,
  });

  const text = res.choices[0].message.content ?? "";

  // -------- Robust parsing --------
  let critique = "Unknown";
  let finalReply = originalReply;
  try {
    const critiqueMatch = text.match(/\[CRITIQUE\]:\s*(.+?)(?:\n|$)/i);
    const replyMatch = text.match(/\[FINAL REPLY\]:\s*([\s\S]+)/i);
    if (critiqueMatch && replyMatch) {
      critique = critiqueMatch[1].trim();
      finalReply = replyMatch[1].trim() || originalReply;
      if (!replyMatch[1].trim()) {
        critique += " [WARNING: Final reply was empty, returned original.]";
      }
    } else {
      // fallback naive parsing
      const critIdx = text.indexOf("[CRITIQUE]:");
      const replyIdx = text.indexOf("[FINAL REPLY]:");
      if (critIdx !== -1 && replyIdx !== -1) {
        critique = text.substring(critIdx + 11, replyIdx).trim();
        finalReply = text.substring(replyIdx + 14).trim() || originalReply;
        if (!finalReply) {
          critique += " [WARNING: Final reply was empty, returned original.]";
          finalReply = originalReply;
        }
      } else {
        critique =
          "Format error: Could not parse critique/final reply. Returned original.";
      }
    }
  } catch (err) {
    console.error("[CritiqueAgent] Exception during parsing:", err);
    critique = "Exception during parsing. Returned original.";
  }

  return { critique, finalReply };
}
