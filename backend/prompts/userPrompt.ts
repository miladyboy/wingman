type UserPromptParams = {
  history?: string;
  message?: string;
  imageDescription?: string;
  preferences?: string;
};

function userPrompt({ history, message, imageDescription, preferences }: UserPromptParams): string {
  let prompt = "";

  if (preferences) {
    prompt += `User Preferences:\n${preferences}\n\n`;
  }
  if (history) {
    prompt += `Chat history:\n${history}\n\n`;
  }
  if (message) {
    prompt += `Latest message:\n${message}\n\n`;
  }
  if (imageDescription) {
    prompt += `[Image Description: ${imageDescription}]\n`;
  }

  // Add more dynamic logic as needed
  return prompt.trim();
}

export default userPrompt;

export function getFallbackImageAnalysisPrompt(): string {
  return 'Please analyze these images and give me your advice.';
}

export function getImageDescriptionPrompt(): string {
  return `=== Image Analysis ===

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
<Rich multi‑sentence description>`;
} 