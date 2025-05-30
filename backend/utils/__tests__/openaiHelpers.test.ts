import { toOpenAIContent } from '../openaiHelpers';

describe('toOpenAIContent', () => {
  it('converts text and image_url types to input_* variants', () => {
    const input = [
      { type: 'text', text: 'hello' },
      { type: 'image_url', image_url: { url: 'http://img.com/a.jpg' } },
    ];
    const result = toOpenAIContent(input);
    expect(result).toEqual([
      { type: 'input_text', text: 'hello' },
      { type: 'input_image', image_url: 'http://img.com/a.jpg' },
    ]);
  });

  it('passes through already normalised items', () => {
    const input = [
      { type: 'input_text', text: 'hi' },
      { type: 'input_image', image_url: 'http://img.com/b.jpg' },
    ];
    expect(toOpenAIContent(input)).toEqual(input);
  });
});
