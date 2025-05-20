import { readFileSync } from 'fs';
import path from 'path';

/**
 * Loads the system prompt from a text file for easy editing and versioning.
 * Logs the file path and any errors encountered.
 */
export function buildSystemPrompt(): string {
  const promptPath = path.join(__dirname, '../prompts/systemPrompt.txt');
  try {
    console.log(`[PromptBuilder] Loading system prompt from: ${promptPath}`);
    const prompt = readFileSync(promptPath, 'utf-8').trim();
    return prompt;
  } catch (error) {
    console.error(`[PromptBuilder] Failed to load system prompt:`, error);
    throw new Error('System prompt file could not be loaded.');
  }
} 