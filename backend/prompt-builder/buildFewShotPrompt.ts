import { PromptInput } from './types';
import path from 'path';
import { readFileSync, existsSync } from 'fs';

/**
 * Loads a few-shot prompt example for the given intent and stage, if available.
 * Logs the file path and whether it was found.
 */
export function buildFewShotPrompt({ intent, stage }: PromptInput): string | null {
  const file = path.join(__dirname, `../fewshots/${intent}-${stage}.md`);
  if (!existsSync(file)) {
    console.log(`[PromptBuilder] No few-shot file found for: ${file}`);
    return null;
  }
  try {
    console.log(`[PromptBuilder] Loading few-shot prompt from: ${file}`);
    return readFileSync(file, 'utf-8').trim();
  } catch (error) {
    console.error(`[PromptBuilder] Failed to load few-shot prompt:`, error);
    return null;
  }
} 