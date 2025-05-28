import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { PromptInput } from "../types/prompt";
import {
  getImageDescriptionPrompt,
  getFallbackImageAnalysisPrompt,
} from "../prompts/userPrompt";
import { getNicknamePrompt } from "../prompts/nicknamePrompts";
import { systemPrompt } from "../prompts/systemPrompt";
import { readFileSync, existsSync } from "fs";
import path from "path";

/**
 * Centralized Prompt Service
 * Provides helpers to build all prompt variants used across the backend.
 */
export class PromptService {
  /**
   * Builds the main chat prompt (system + optional few-shot + user) as an array of role messages.
   * @param input Structured prompt input
   * @returns ChatCompletionMessageParam[] suitable for OpenAI Responses API
   */
  static buildMainPrompt(input: PromptInput): ChatCompletionMessageParam[] {
    const fewShot = this.buildFewShotPrompt(input);
    const user = this.buildUserPrompt(input);

    const messages: ChatCompletionMessageParam[] = [systemPrompt()];

    if (fewShot) {
      // Few-shot examples are treated as an assistant message so the model sees them as prior completions.
      messages.push({ role: "assistant", content: fewShot });
    }

    messages.push({ role: "user", content: user });
    return messages;
  }

  /**
   * Builds a prompt for image analysis using the Vision-capable Responses API.
   * Accepts the array of mixed input content already prepared by caller.
   * @param content Array of {type: "input_text"|"input_image", ...} items matching OpenAI SDK expectations
   */
  static buildImageAnalysisPrompt(
    content: any[]
  ): ChatCompletionMessageParam[] {
    const basePrompt = getImageDescriptionPrompt();
    const promptText =
      typeof basePrompt.content === "string"
        ? basePrompt.content
        : "Please describe the image.";

    // Prepend analysis instructions then provided content array
    const promptContent = [
      { type: "input_text", text: promptText },
      ...content,
    ];
    return [
      {
        role: "user",
        content: promptContent as any,
      },
    ];
  }

  /**
   * Returns a minimal fallback image analysis prompt (used when user provides images but no message).
   */
  static buildFallbackImageAnalysisPrompt(): ChatCompletionMessageParam[] {
    const fallback = getFallbackImageAnalysisPrompt();
    return [fallback];
  }

  /**
   * Builds a prompt to generate a nickname from arbitrary text (and optional image description).
   * @param userMessage The text to base nickname generation on
   * @param imageDescription Optional image description to include for more context
   */
  static buildNicknamePrompt(
    userMessage: string,
    imageDescription?: string
  ): ChatCompletionMessageParam[] {
    if (imageDescription && imageDescription.trim().length > 0) {
      const prompt = `Based on the following message and image description, invent a short, playful, SFW nickname for the subject described.\nMessage: "${userMessage}"\nImage Description: "${imageDescription}"\nNickname:`;
      return [{ role: "user", content: prompt }];
    }
    // Fallback to legacy helper
    return [getNicknamePrompt(userMessage) as ChatCompletionMessageParam];
  }

  private static buildUserPrompt(input: PromptInput): string {
    const {
      userPreferences,
      chatHistory,
      latestMessage,
      imageDescriptions,
      intent,
      stage,
      preferredCountry,
      simpPreference,
    } = input;

    let prompt = `// Intent: ${intent}, Stage: ${stage}, Country: ${
      preferredCountry ?? "auto"
    }, SimpPreference: ${simpPreference ?? "auto"}\n\n`;
    if (userPreferences && userPreferences.trim().length > 0) {
      prompt += `User Preferences:\n${userPreferences.trim()}\n\n`;
    }
    if (chatHistory) prompt += `Chat History:\n${chatHistory.trim()}\n\n`;
    prompt += `Latest Message:\n${latestMessage.trim()}\n\n`;

    if (imageDescriptions?.length) {
      for (const desc of imageDescriptions) {
        prompt += `[Image Description: ${desc.trim()}]\n`;
      }
    }

    return prompt.trim();
  }

  private static buildFewShotPrompt(input: PromptInput): string | null {
    const file = path.join(
      __dirname,
      `../fewshots/${input.intent}-${input.stage}.md`
    );
    if (!existsSync(file)) {
      return null;
    }
    try {
      return readFileSync(file, "utf-8").trim();
    } catch {
      return null;
    }
  }
}
