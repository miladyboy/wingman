import type { Stage } from '../types/prompt';

/**
 * Checks if a given value is a valid Stage string.
 */
export function isValidStage(value: any): value is Stage {
  return value === 'Opening' || value === 'Continue' || value === 'ReEngage';
}

/**
 * Infers the conversation stage based on chat history and draft status.
 * - If isDraft is true, it's always "Continue".
 * - If there is no history, the stage is "Opening".
 * - If the last message came from the user, the stage is "ReEngage".
 * - Otherwise defaults to "Continue".
 */
export function inferStage(history: any[], isDraft: boolean): Stage {
  if (isDraft) return 'Continue';
  if (!history || history.length === 0) return 'Opening';
  const lastMsg = history[history.length - 1];
  if (lastMsg && (lastMsg.sender === 'user' || lastMsg.role === 'user')) {
    return 'ReEngage';
  }
  return 'Continue';
}
