import type { ChatCompletionUserMessageParam } from 'openai/resources/chat/completions';

/**
 * Returns the prompt for generating a playful, SFW nickname from a text message.
 * The nickname should be fun, positive, and non-identifying.
 * Do not attempt to recognize or identify anyone. Do not mention inability to identify.
 * Use only neutral, descriptive, or playful words. The nickname must be in the same language as the input.
 * 
 * @param newMessageText The text message to generate a nickname from
 * @returns A structured user role message for OpenAI API
 */
export function getNicknamePrompt(newMessageText: string): ChatCompletionUserMessageParam {
  return {
    role: 'user',
    content: `Based on the following message, invent a short, playful, SFW nickname for the subject described. If a name is provided, include it in the nickname (e.g., Anna Bright Eyes). If not, use just 1-3 positive, descriptive words (e.g., Bright Eyes, Sunshine Smile). Do not attempt to recognize or identify anyone. Do not mention inability to identify. The nickname must be fun, non-identifying, and in the same language as the input.\n\n"${newMessageText}"\n\nNickname:`
  };
}

/**
 * Returns the prompt for image description and playful nickname generation.
 * The description should be detailed and neutral. The nickname should be fun, SFW, and non-identifying.
 * 
 * @returns A structured user role message for OpenAI API
 */
export function getImageDescriptionAndNicknamePrompt(): ChatCompletionUserMessageParam {
  return {
    role: 'user',
    content: `Please provide a detailed description of the image.`
  };
}
