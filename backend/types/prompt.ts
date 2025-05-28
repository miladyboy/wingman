import type { SimpPreference } from "./user";

export type IntentMode = "NewSuggestions" | "RefineDraft";
export type Stage = "Opening" | "Continue" | "ReEngage";

export interface PromptInput {
  intent: IntentMode;
  stage: Stage;
  userPreferences: string;
  chatHistory?: string;
  latestMessage: string;
  imageDescriptions?: string[];
  preferredCountry?: string;
  simpPreference?: SimpPreference;
}
