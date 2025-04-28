import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY as string });

async function callOpenAI(
  messages: ChatCompletionMessageParam[],
  max_tokens: number = 500,
  model: string = 'gpt-4o'
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model,
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

export { callOpenAI }; 