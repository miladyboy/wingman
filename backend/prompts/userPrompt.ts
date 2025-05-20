import type { ChatCompletionUserMessageParam } from 'openai/resources/chat/completions';

type UserPromptParams = {
  history?: string;
  message?: string;
  imageDescription?: string;
  preferences?: string;
  nickname?: string;
};

/**
 * Returns a structured user message for OpenAI API.
 * @param params Parameters for constructing the user message
 * @returns A structured user role message for OpenAI API
 */
function userPrompt({ history, message, imageDescription, preferences, nickname }: UserPromptParams): ChatCompletionUserMessageParam {
  let content = "";

  if (preferences) {
    content += `User Preferences:\n${preferences}\n\n`;
  }
  if (history) {
    content += `Chat history:\n${history}\n\n`;
  }
  if (message) {
    content += `Latest message:\n${message}\n\n`;
  }
  if (imageDescription) {
    content += `[Image Description: ${imageDescription}]\n`;
  }
  if (nickname) {
    content += `[Nickname: ${nickname}]\n`;
  }

  return {
    role: 'user',
    content: content.trim()
  };
}

export default userPrompt;

/**
 * Returns a fallback user message for image analysis.
 * @returns A structured user role message for OpenAI API
 */
export function getFallbackImageAnalysisPrompt(): ChatCompletionUserMessageParam {
  return {
    role: 'user',
    content: 'Please analyze these images and give me your advice.'
  };
}

/**
 * Returns a user message for requesting image description.
 * @returns A structured user role message for OpenAI API
 */
export function getImageDescriptionPrompt(): ChatCompletionUserMessageParam {
  return {
    role: 'user',
    content: `=== Image Analysis ===

INSTRUCTIONS

1. IMAGE TYPE
• Decide which category best fits the attachment:
  – Photo             (a picture containing a person)
  – ConversationShot  (screenshot of chat messages)
  – ProfileMetadata   (screenshot of a dating‑app or social profile with bio/stats)

2. DESCRIPTION
• Produce a rich, multi‑sentence description with every detail useful for chat logic.
  • Photo → appearance (hair colour, eye colour if visible, facial expression, physique), outfit & style, accessories, setting/background, activity, companions, overall vibe.
  • ConversationShot → transcribe each message with sender labels, note the platform (Tinder, Bumble, IG, WhatsApp, etc.), capture emojis, reactions, timestamps.
  • ProfileMetadata → extract every visible datapoint: bio lines, prompts, interests, job, education, distance, anthem, Spotify artists, etc.
• Never attempt to identify the person by real name, and never mention any inability to identify.

3. OUTPUT FORMAT
<Rich multi‑sentence description>`
  };
} 