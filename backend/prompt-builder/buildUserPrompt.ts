import { PromptInput } from './types';

/**
 * Builds the user prompt string from structured input.
 * Logs the input and the resulting prompt for debugging.
 * Includes intent and stage as an inline comment for LLM clarity.
 */
export function buildUserPrompt(input: PromptInput): string {
  console.log('[PromptBuilder] Building user prompt with input:', input);
  const { userPreferences, chatHistory, latestMessage, imageDescriptions, intent, stage, preferredLanguage, simpPreference } = input;

  let prompt = `// Intent: ${intent}, Stage: ${stage}`;
  if (preferredLanguage) {
    prompt += `, Preferred Language: ${preferredLanguage}`;
    console.log('[PromptBuilder] Preferred Language:', preferredLanguage);
  }
  if (simpPreference) {
    prompt += `, SimpPreference: ${simpPreference}`;
    console.log('[PromptBuilder] SimpPreference:', simpPreference);
  }
  prompt += '\n\n';
  prompt += `User Preferences:\n${userPreferences.trim()}\n\n`;
  if (chatHistory) prompt += `Chat History:\n${chatHistory.trim()}\n\n`;
  prompt += `Latest Message:\n${latestMessage.trim()}\n\n`;

  if (imageDescriptions?.length) {
    for (const desc of imageDescriptions) {
      prompt += `[Image Description: ${desc.trim()}]\n`;
    }
  }

  const result = prompt.trim();
  console.log('[PromptBuilder] Built user prompt:', result);
  return result;
} 