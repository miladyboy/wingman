/**
 * Returns the prompt for generating a nickname from a text message.
 * Instructs the LLM to invent a short, catchy, SFW nickname based on the vibe, style, or features described in the text.
 * If a name is provided in the text, include it in the nickname (e.g., 'Anna Bright Eyes').
 * Do not attempt to recognize or identify anyone. Do not say you cannot identify people. Just invent a fun nickname as described.
 * The nickname must be in the same language as the input message.
 */
export function getNicknamePrompt(newMessageText: string): string {
  return `Based on the following message, invent a short, catchy, SFW nickname for the girl described. If a name is provided, include it in the nickname (e.g., Anna Bright Eyes). If not, use just 1-3 descriptive words (e.g., Bright Eyes, Sunshine Smile). Do not attempt to recognize or identify anyone. Do not say you cannot identify people. Just invent a fun nickname as described. The nickname must be in the same language as the input message.\n\n"${newMessageText}"\n\nNickname:`;
}

/**
 * Returns the prompt for generating an image description and nickname from image(s) and text.
 * Invent a short, catchy, SFW nickname for the girl in the image(s) based on her vibe, style, or features. If a name is provided in the text, include it in the nickname (e.g., Anna Bright Eyes). If not, use just 1-3 descriptive words (e.g., Bright Eyes, Sunshine Smile). Do not attempt to recognize or identify anyone. Do not say you cannot identify people. Just invent a fun nickname as described. The nickname must be in the same language as the input message.
 */
export function getImageDescriptionAndNicknamePrompt(): string {
  return 'Describe the image(s) briefly for context in a chat analysis. Focus on the people, setting, and overall vibe. Then, invent a short, catchy, SFW nickname for the girl in the image(s) based on her vibe, style, or features. If a name is provided in the text, include it in the nickname (e.g., Anna Bright Eyes). If not, use just 1-3 descriptive words (e.g., Bright Eyes, Sunshine Smile, Adventurous Spirit). Do not attempt to recognize or identify anyone. Do not say you cannot identify people. Just invent a fun nickname as described. The nickname must be in the same language as the input message. Output the description, then the nickname on a new line as Nickname:.';
} 