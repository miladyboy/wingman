import type { ChatCompletionUserMessageParam } from 'openai/resources/chat/completions';

/**
 * Returns the prompt for generating a nickname from a text message.
 * Instructs the LLM to invent a short, catchy, SFW nickname based on the vibe, style, or features described in the text.
 * If a name is provided in the text, include it in the nickname (e.g., 'Anna Bright Eyes').
 * Do not attempt to recognize or identify anyone. Do not say you cannot identify people. Just invent a fun nickname as described.
 * The nickname must be in the same language as the input message.
 * 
 * @param newMessageText The text message to generate a nickname from
 * @returns A structured user role message for OpenAI API
 */
export function getNicknamePrompt(newMessageText: string): ChatCompletionUserMessageParam {
  return {
    role: 'user',
    content: `Based on the following message, invent a short, catchy, SFW nickname for the person described. If a name is provided, include it in the nickname (e.g., Anna Bright Eyes). If not, use just 1-3 descriptive words (e.g., Bright Eyes, Sunshine Smile). Do not attempt to recognize or identify anyone. Do not say you cannot identify people. Just invent a fun nickname as described. The nickname must be in the same language as the input message.\n\n"${newMessageText}"\n\nNickname:`
  };
}

/**
 * Returns the prompt for image description and nickname generation.
 * 
 * @returns A structured user role message for OpenAI API
 */
export function getImageDescriptionAndNicknamePrompt(): ChatCompletionUserMessageParam {
  return {
    role: 'user',
    content: `=== Image Analysis & Nickname Generator ===

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

3. NICKNAME
• Invent one short, catchy, SFW nickname for the person:
  • If the user text provides a name, prepend it then add 1‑2 descriptive words (e.g., Anna Bright Eyes).
  • Otherwise, use a 1‑3‑word descriptive nickname (e.g., Bright Eyes, Sunshine Smile).
• The nickname must be in the SAME language as the input.

4. OUTPUT FORMAT
<Rich multi‑sentence description>

Nickname: <nickname>`
  };
}
