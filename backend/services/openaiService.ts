import OpenAI from "openai";
import type { ResponseTextDeltaEvent } from "openai/resources/responses/responses";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

/**
 * Service for streaming and non-streaming OpenAI responses.
 * @param apiKey - OpenAI API key (required unless injecting a client)
 * @param defaultModel - Default model name (optional)
 * @param openaiClient - Optional injected OpenAI client (for testing)
 */
class OpenAIService {
  private openai: OpenAI;
  private defaultModel: string;

  /**
   * @param apiKey OpenAI API key (required unless injecting a client)
   * @param defaultModel Default model name (optional)
   * @param openaiClient Optional injected OpenAI client (for testing)
   */
  constructor(
    apiKey: string,
    defaultModel: string = "gpt-4o",
    openaiClient?: OpenAI
  ) {
    console.log(
      "Creating OpenAI client with model:",
      defaultModel,
      "environment is",
      process.env.NODE_ENV
    );
    this.openai = openaiClient || new OpenAI({ apiKey });
    this.defaultModel = defaultModel;
  }

  /**
   * Exposes the underlying OpenAI client for advanced use cases (e.g., Critique Agent).
   */
  getOpenAIClient(): OpenAI {
    return this.openai;
  }

  /**
   * Streams a response from OpenAI using the new Responses API with structured messages.
   * @param messages - Array of chat messages (role/content)
   * @param onData - Callback for each text chunk
   * @param model - Optional model override
   * @throws Error if the OpenAI API or stream fails
   * @returns Promise that resolves when streaming is done
   */
  async streamChatCompletion(
    messages: ChatCompletionMessageParam[],
    onData: (text: string) => void,
    model?: string
  ): Promise<void> {
    try {
      // The OpenAI Responses API accepts an array of messages
      // but TypeScript definitions are strict, so we use type assertion
      const stream = this.openai.responses.stream({
        model: model || this.defaultModel,
        input: messages as any,
      });

      for await (const event of stream) {
        if (event.type === "response.output_text.delta") {
          onData((event as ResponseTextDeltaEvent).delta);
        }
        // Optionally, handle 'response.output_text.done' if you want to signal completion
      }
    } catch (err: any) {
      throw new Error(`OpenAI API Error (stream): ${err.message || err}`);
    }
  }

  /**
   * Calls OpenAI's responses endpoint and returns the result as a string.
   * @param messages - Array of chat messages (role/content)
   * @param maxTokens - Optional max tokens for the response (not supported by Responses API currently)
   * @param model - Optional model override
   * @throws Error if the OpenAI API fails or returns an invalid response
   * @returns The completion result as a string
   */
  async callOpenAI(
    messages: ChatCompletionMessageParam[],
    maxTokens: number = 500,
    model?: string
  ): Promise<string> {
    try {
      console.log("Calling OpenAI with model:", model || this.defaultModel);

      const response = await this.openai.responses.create({
        model: model || this.defaultModel,
        input: messages as any,
      });

      if (!response || typeof response.output_text !== "string") {
        throw new Error("OpenAI API returned invalid or no content.");
      }

      return response.output_text;
    } catch (err: any) {
      throw new Error(`OpenAI API Error: ${err.message || err}`);
    }
  }
}

export { OpenAIService };
