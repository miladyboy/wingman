import { PromptInput } from "./types";
import { buildSystemPrompt } from "./buildSystemPrompt";
import { buildUserPrompt } from "./buildUserPrompt";
import { buildFewShotPrompt } from "./buildFewShotPrompt";

/**
 * Builds the full prompt for the LLM, combining system, few-shot, and user prompts.
 * Logs the final output for traceability.
 *
 * @param input - The input parameters for prompt construction, including user and context data
 * @returns The complete prompt string to be sent to the LLM
 * @example
 */
export function buildFullPrompt(input: PromptInput): string {
  const system = buildSystemPrompt();
  const fewShot = buildFewShotPrompt(input);
  const user = buildUserPrompt(input);

  const fullPrompt = [system, fewShot, user]
    .filter(Boolean)
    .join("\n\n")
    .trim();
  console.log("[PromptBuilder] Built full prompt:", fullPrompt);
  return fullPrompt;
}

export { buildSystemPrompt, buildUserPrompt, buildFewShotPrompt };
