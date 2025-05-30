export interface RawInputItem {
  type: string;
  text?: string;
  image_url?: { url: string } | string;
}

export interface OpenAIInputItem {
  type: 'input_text' | 'input_image';
  text?: string;
  image_url?: string;
}

/**
 * Converts mixed message content into the format expected by the OpenAI SDK.
 * Items using our internal 'text' or 'image_url' shape are normalised to
 * 'input_text' and 'input_image' respectively. Any already normalised items are
 * returned as-is so the function can be used on previously processed arrays.
 */
export function toOpenAIContent(items: RawInputItem[]): OpenAIInputItem[] {
  return items.map((item) => {
    if (item.type === 'text') {
      return { type: 'input_text', text: item.text };
    }
    if (item.type === 'image_url') {
      const url = typeof item.image_url === 'string' ? item.image_url : item.image_url?.url;
      return { type: 'input_image', image_url: url };
    }
    if (item.type === 'input_text' || item.type === 'input_image') {
      return item as OpenAIInputItem;
    }
    return item as OpenAIInputItem;
  });
}
