const mockCallOpenAI_for_generateImageDescription = jest.fn();

jest.mock('../../services/openaiService', () => {
    return {
        OpenAIService: jest.fn().mockImplementation(() => {
            return { callOpenAI: mockCallOpenAI_for_generateImageDescription };
        }),
    };
});

import { generateImageDescription } from '../analyzeController';
import { OpenAIService } from '../../services/openaiService';
import { getImageDescriptionPrompt } from '../../prompts/userPrompt';

// Mock OpenAIService (can share mock setup if in same context or re-mock)
// const mockCallOpenAI_for_generateImageDescription = jest.fn(); // Moved up
// jest.mock('../../services/openaiService', () => { // Moved up
//     // Ensure this mock is compatible if other tests for openaiService exist in the same suite run
//     // Or use jest.doMock if needing to be very specific for this test file only
//     return {
//         OpenAIService: jest.fn().mockImplementation(() => {
//             // This instance will be used by the SUT if it instantiates OpenAIService itself
//             // Or, if an instance is passed, that instance (mocked) will be used.
//             return { callOpenAI: mockCallOpenAI_for_generateImageDescription };
//         }),
//     };
// });

const mockOpenAIServiceInstance_for_generateImageDescription = new OpenAIService('dummy-key-desc');

describe('generateImageDescription', () => {
    beforeEach(() => {
        mockCallOpenAI_for_generateImageDescription.mockClear();
    });

    const sampleFinalUserMessageContent = [
        { type: 'input_image', image_url: 'http://example.com/image1.jpg' },
        { type: 'input_text', text: 'Image for description.' },
    ];

    it('should call OpenAI with the correct prompt and return the description', async () => {
        const openAIResponse = 'A detailed description of the image content.';
        mockCallOpenAI_for_generateImageDescription.mockResolvedValue(openAIResponse);

        const result = await generateImageDescription(sampleFinalUserMessageContent, mockOpenAIServiceInstance_for_generateImageDescription);

        expect(mockCallOpenAI_for_generateImageDescription).toHaveBeenCalledTimes(1);
        const expectedPromptArgument = [
            {
                role: 'user',
                content: [
                    { type: 'input_text', text: getImageDescriptionPrompt().content },
                    { type: 'input_image', image_url: 'http://example.com/image1.jpg' },
                    { type: 'input_text', text: 'Image for description.' },
                ],
            },
        ];
        expect(mockCallOpenAI_for_generateImageDescription).toHaveBeenCalledWith(expectedPromptArgument, 250);
        expect(result).toBe(openAIResponse.trim());
    });

    it('should return a default description if OpenAI response is empty', async () => {
        mockCallOpenAI_for_generateImageDescription.mockResolvedValue('   '); // Empty or whitespace response
        const result = await generateImageDescription(sampleFinalUserMessageContent, mockOpenAIServiceInstance_for_generateImageDescription);
        expect(result).toBe('Image(s) analyzed.');
    });

    it('should return an error message if OpenAI call fails', async () => {
        mockCallOpenAI_for_generateImageDescription.mockRejectedValue(new Error('OpenAI API Error'));
        const result = await generateImageDescription(sampleFinalUserMessageContent, mockOpenAIServiceInstance_for_generateImageDescription);
        expect(result).toBe('Error analyzing image(s).');
    });

    it('should trim whitespace from the OpenAI response', async () => {
        const openAIResponse = '  A description with leading/trailing spaces.  ';
        mockCallOpenAI_for_generateImageDescription.mockResolvedValue(openAIResponse);
        const result = await generateImageDescription(sampleFinalUserMessageContent, mockOpenAIServiceInstance_for_generateImageDescription);
        expect(result).toBe('A description with leading/trailing spaces.');
    });
}); 