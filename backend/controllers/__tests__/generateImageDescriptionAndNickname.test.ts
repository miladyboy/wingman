const mockCallOpenAI = jest.fn();

jest.mock('../../services/openaiService', () => {
    return {
        OpenAIService: jest.fn().mockImplementation(() => {
            return { callOpenAI: mockCallOpenAI };
        }),
    };
});

import { generateImageDescriptionAndNickname } from '../analyzeController';
import { OpenAIService } from '../../services/openaiService';
import { getImageDescriptionAndNicknamePrompt } from '../../prompts/nicknamePrompts';

// Mock OpenAIService
// const mockCallOpenAI = jest.fn(); // Moved up
// jest.mock('../../services/openaiService', () => { // Moved up
//     return {
//         OpenAIService: jest.fn().mockImplementation(() => {
//             return { callOpenAI: mockCallOpenAI };
//         }),
//     };
// });

// Create an instance of the mocked service to pass to the function if needed,
// or rely on the default instance used in analyzeController if it also uses this mocked version.
// For direct calls like generateImageDescriptionAndNickname(..., openaiInstance), we pass it.
const mockOpenAIServiceInstance = new OpenAIService('dummy-key');

describe('generateImageDescriptionAndNickname', () => {
    beforeEach(() => {
        mockCallOpenAI.mockClear();
    });

    const sampleFinalUserMessageContent = [
        { type: 'image_url', image_url: { url: 'http://example.com/image1.jpg' } },
        { type: 'text', text: 'Look at this!' },
    ];

    it('should call OpenAI with the correct prompt structure and parse nickname and description', async () => {
        const openAIResponse = 'Image Description: A cat wearing a party hat.\nNickname: Anna Bright Eyes';
        mockCallOpenAI.mockResolvedValue(openAIResponse);

        const result = await generateImageDescriptionAndNickname(sampleFinalUserMessageContent, mockOpenAIServiceInstance);

        expect(mockCallOpenAI).toHaveBeenCalledTimes(1);
        const expectedPromptArgument = [
            {
                role: 'user',
                content: [
                    { type: 'text', text: getImageDescriptionAndNicknamePrompt() },
                    ...sampleFinalUserMessageContent,
                ],
            },
        ];
        expect(mockCallOpenAI).toHaveBeenCalledWith(expectedPromptArgument, 100);

        expect(result.nickname).toBe('Anna Bright Eyes');
        expect(result.imageDescription).toBe('Image Description: A cat wearing a party hat.');
    });

    it('should handle LLM response with just descriptors as nickname', async () => {
        const openAIResponse = 'Image Description: A girl hiking in the mountains.\nNickname: Adventurous Spirit';
        mockCallOpenAI.mockResolvedValue(openAIResponse);
        const result = await generateImageDescriptionAndNickname(sampleFinalUserMessageContent, mockOpenAIServiceInstance);
        expect(result.nickname).toBe('Adventurous Spirit');
        expect(result.imageDescription).toBe('Image Description: A girl hiking in the mountains.');
    });

    it('should handle edge case: LLM returns only whitespace', async () => {
        mockCallOpenAI.mockResolvedValue('   ');
        const result = await generateImageDescriptionAndNickname(sampleFinalUserMessageContent, mockOpenAIServiceInstance);
        expect(result.nickname).toBe('Mystery Girl');
        expect(result.imageDescription).toBe('Image(s) received.');
    });

    it('should handle OpenAI response with nickname on a new line without prefix', async () => {
        const openAIResponse = 'A dog playing fetch.\nFetchy';
        mockCallOpenAI.mockResolvedValue(openAIResponse);

        const result = await generateImageDescriptionAndNickname(sampleFinalUserMessageContent, mockOpenAIServiceInstance);
        expect(result.nickname).toBe('Fetchy');
        expect(result.imageDescription).toBe('A dog playing fetch.');
    });

    it('should use default nickname if OpenAI response is empty or malformed for nickname', async () => {
        mockCallOpenAI.mockResolvedValue('Just an image description here.');
        let result = await generateImageDescriptionAndNickname(sampleFinalUserMessageContent, mockOpenAIServiceInstance);
        expect(result.nickname).toBe('Just an image description here.');
        expect(result.imageDescription).toBe('Image(s) received.');

        mockCallOpenAI.mockClear();
        mockCallOpenAI.mockResolvedValue('');
        result = await generateImageDescriptionAndNickname(sampleFinalUserMessageContent, mockOpenAIServiceInstance);
        expect(result.nickname).toBe('Mystery Girl');
        expect(result.imageDescription).toBe('Image(s) received.');
    });

    it('should use default image description if OpenAI response provides nickname but no description', async () => {
        mockCallOpenAI.mockResolvedValue('Nickname: Speedy');
        const result = await generateImageDescriptionAndNickname(sampleFinalUserMessageContent, mockOpenAIServiceInstance);
        expect(result.nickname).toBe('Speedy');
        expect(result.imageDescription).toBe('Image(s) received.');
    });

    it('should handle nickname with mixed case and extra spaces', async () => {
        const openAIResponse = 'Image: bla bla.\nNiCkNaMe:  Cool Cat  ';
        mockCallOpenAI.mockResolvedValue(openAIResponse);

        const result = await generateImageDescriptionAndNickname(sampleFinalUserMessageContent, mockOpenAIServiceInstance);
        expect(result.nickname).toBe('Cool Cat');
        expect(result.imageDescription).toBe('Image: bla bla.');
    });

    it('should correctly parse multiline descriptions', async () => {
        const openAIResponse = 'Line 1 of description.\nLine 2 of description.\nNickname: MultiLiner';
        mockCallOpenAI.mockResolvedValue(openAIResponse);
        const result = await generateImageDescriptionAndNickname(sampleFinalUserMessageContent, mockOpenAIServiceInstance);
        expect(result.nickname).toBe('MultiLiner');
        expect(result.imageDescription).toBe('Line 1 of description.\nLine 2 of description.');
    });

    it('should filter out the nickname line from the description if nickname is last', async () => {
        const openAIResponse = 'This is the description.\nThis is also description.\nMyNick';
        mockCallOpenAI.mockResolvedValue(openAIResponse);
        const result = await generateImageDescriptionAndNickname(sampleFinalUserMessageContent, mockOpenAIServiceInstance);
        expect(result.nickname).toBe('MyNick');
        expect(result.imageDescription).toBe('This is the description.\nThis is also description.');
    });
}); 