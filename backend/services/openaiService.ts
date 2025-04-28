import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

class OpenAIService {
  private openai: OpenAI;
  private defaultModel: string;

  constructor(apiKey: string, defaultModel: string = 'gpt-4o') {
    this.openai = new OpenAI({ apiKey });
    this.defaultModel = defaultModel;
  }

  async callOpenAI(
    messages: ChatCompletionMessageParam[],
    max_tokens: number = 500,
    model?: string
  ): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: model || this.defaultModel,
        messages,
        max_tokens,
      });
      const content = response.choices[0].message.content;
      if (content === null) {
        throw new Error('OpenAI API returned a null message content.');
      }
      return content;
    } catch (error: any) {
      console.error('Error calling OpenAI API:', error);
      throw new Error(`OpenAI API Error: ${error.message}`);
    }
  }
}

export { OpenAIService }; 