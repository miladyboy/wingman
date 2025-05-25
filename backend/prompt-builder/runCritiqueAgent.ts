import { OpenAI } from "openai";
import { PromptInput } from "./types";
import { buildSystemPrompt } from "./buildSystemPrompt";
import { buildUserPrompt } from "./buildUserPrompt";
import fs from "fs";
import path from "path";

/**
 * Ejecuta el Critique Agent para revisar y corregir la respuesta del LLM.
 * @param input PromptInput original
 * @param originalReply Respuesta generada por el LLM
 * @param openaiClient Instancia de OpenAI
 * @returns { critique: string, finalReply: string }
 */
export async function runCritiqueAgent(
  input: PromptInput,
  originalReply: string,
  openaiClient: OpenAI
): Promise<{ critique: string; finalReply: string }> {
  const system = buildSystemPrompt();
  const user = buildUserPrompt(input);

  // Cargar el template solo cuando se llama la función
  const critiqueTemplate = fs.readFileSync(
    path.join(__dirname, "../prompts/critiqueAgentPrompt.txt"),
    "utf-8"
  );

  const critiquePrompt = `
${critiqueTemplate}

=== SYSTEM RULES ===
${system}

=== USER INPUT ===
${user}

=== AI-GENERATED REPLY ===
${originalReply}
  `.trim();

  const res = await openaiClient.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a quality control agent for AI flirting messages.",
      },
      { role: "user", content: critiquePrompt },
    ],
    model: "gpt-4",
    temperature: 0.3,
  });

  const text = res.choices[0].message.content!;
  console.log("[CritiqueAgent] Raw response:", text);

  // Robust parsing: handle missing or malformed sections
  let critique = "Unknown";
  let finalReply = originalReply;
  try {
    const critiqueMatch = text.match(/\[CRITIQUE\]:\s*(.+?)(?:\n|$)/i);
    const replyMatch = text.match(/\[FINAL REPLY\]:\s*([\s\S]+)/i);
    if (critiqueMatch && replyMatch) {
      critique = critiqueMatch[1].trim();
      finalReply = replyMatch[1].trim();
      if (!finalReply) {
        console.warn(
          "[CritiqueAgent] [FINAL REPLY] section is empty. Returning original reply."
        );
        finalReply = originalReply;
        critique += " [WARNING: Final reply was empty, returned original.]";
      }
    } else {
      // Fallback: try to split by markers manually
      const critIdx = text.indexOf("[CRITIQUE]:");
      const replyIdx = text.indexOf("[FINAL REPLY]:");
      if (critIdx !== -1 && replyIdx !== -1) {
        critique = text.substring(critIdx + 11, replyIdx).trim();
        finalReply = text.substring(replyIdx + 14).trim() || originalReply;
        critique += " [WARNING: Parsed with fallback logic.]";
      } else {
        // No recognizable format
        console.error(
          "[CritiqueAgent] Could not parse critique/final reply. Returning original."
        );
        critique =
          "Format error: Could not parse critique/final reply. Returned original.";
        finalReply = originalReply;
      }
    }
  } catch (err) {
    console.error("[CritiqueAgent] Exception during parsing:", err);
    critique = "Exception during parsing. Returned original.";
    finalReply = originalReply;
  }

  console.log("[CritiqueAgent] Parsed critique:", critique);
  console.log("[CritiqueAgent] Parsed final reply:", finalReply);
  return {
    critique,
    finalReply,
  };
}
