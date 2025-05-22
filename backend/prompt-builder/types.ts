// Common types for prompt building

export type IntentMode = 'NewSuggestions' | 'RefineDraft';
export type Stage = 'Opening' | 'Continue' | 'ReEngage';
export type SimpPreference = 'auto' | 'low' | 'neutral' | 'high';

export interface PromptInput {
  intent: IntentMode;
  stage: Stage;
  userPreferences: string;
  chatHistory?: string;
  latestMessage: string;
  imageDescriptions?: string[];
  preferredCountry?: string; // e.g., "Argentina", "France", "Mexico"
  simpPreference?: SimpPreference;
} 