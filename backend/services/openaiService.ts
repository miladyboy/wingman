import OpenAI from 'openai';
import type { ResponseTextDeltaEvent } from 'openai/resources/responses/responses';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

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
  constructor(apiKey: string, defaultModel: string = 'gpt-4o', openaiClient?: OpenAI) {
    this.openai = openaiClient || new OpenAI({ apiKey });
    this.defaultModel = defaultModel;
  }

  /**
   * Streams a response from OpenAI using the new Responses API.
   * @param prompt - The prompt string to send to OpenAI
   * @param onData - Callback for each text chunk
   * @param model - Optional model override
   * @throws Error if the OpenAI API or stream fails
   * @returns Promise that resolves when streaming is done
   */
  async streamChatCompletion(
    prompt: string,
    onData: (text: string) => void,
    model?: string
  ): Promise<void> {
    try {
      const stream = this.openai.responses.stream({
        model: model || this.defaultModel,
        input: prompt,
      });
      for await (const event of stream) {
        if (event.type === 'response.output_text.delta') {
          onData((event as ResponseTextDeltaEvent).delta);
        }
        // Optionally, handle 'response.output_text.done' if you want to signal completion
      }
    } catch (err: any) {
      throw new Error(`OpenAI API Error (stream): ${err.message || err}`);
    }
  }

  /**
   * Calls OpenAI's chat completion endpoint and returns the result as a string.
   * @param messages - Array of chat messages (role/content)
   * @param maxTokens - Optional max tokens for the response
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
      const response = await this.openai.chat.completions.create({
        model: model || this.defaultModel,
        messages,
        max_tokens: maxTokens,
      });
      // Defensive checks for response shape
      if (!response || !Array.isArray(response.choices) || response.choices.length === 0) {
        throw new Error('OpenAI API returned no choices.');
      }
      const content = response.choices[0]?.message?.content;
      if (content == null) {
        throw new Error('OpenAI API returned a null message content.');
      }
      return content;
    } catch (err: any) {
      throw new Error(`OpenAI API Error: ${err.message || err}`);
    }
  }
}

export { OpenAIService }; 