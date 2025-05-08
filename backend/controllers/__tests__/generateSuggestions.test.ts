const mockCallOpenAI_for_generateSuggestions = jest.fn();

jest.mock('../../services/openaiService', () => {
    return {
        OpenAIService: jest.fn().mockImplementation(() => {
            return { callOpenAI: mockCallOpenAI_for_generateSuggestions };
        }),
    };
});

import { generateSuggestions } from '../analyzeController';
import { OpenAIService } from '../../services/openaiService';

// Mock OpenAIService
// const mockCallOpenAI_for_generateSuggestions = jest.fn(); // Moved up
// jest.mock('../../services/openaiService', () => { // Moved up
//     return {
//         OpenAIService: jest.fn().mockImplementation(() => {
//             return { callOpenAI: mockCallOpenAI_for_generateSuggestions };
//         }),
//     };
// });

const mockOpenAIServiceInstance_for_generateSuggestions = new OpenAIService('dummy-key-suggestions');

describe('generateSuggestions', () => {
    beforeEach(() => {
        mockCallOpenAI_for_generateSuggestions.mockClear();
    });

    const sampleConversation = [
        { role: 'user', content: 'Hello there!' },
        { role: 'assistant', content: 'Hi! How can I help you?' },
    ];

    it('should call OpenAI with the conversation and parse newline-separated suggestions', async () => {
        const openAIResponse = '1. Suggestion one.\n2. Suggestion two.\n3. Suggestion three.';
        mockCallOpenAI_for_generateSuggestions.mockResolvedValue(openAIResponse);

        const result = await generateSuggestions(sampleConversation, mockOpenAIServiceInstance_for_generateSuggestions);

        expect(mockCallOpenAI_for_generateSuggestions).toHaveBeenCalledTimes(1);
        expect(mockCallOpenAI_for_generateSuggestions).toHaveBeenCalledWith(sampleConversation, 300);
        expect(result).toEqual(['Suggestion one.', 'Suggestion two.', 'Suggestion three.']);
    });

    it('should parse suggestions separated by asterisks', async () => {
        const openAIResponse = '* Suggestion A\n* Suggestion B';
        mockCallOpenAI_for_generateSuggestions.mockResolvedValue(openAIResponse);
        const result = await generateSuggestions(sampleConversation, mockOpenAIServiceInstance_for_generateSuggestions);
        expect(result).toEqual(['Suggestion A', 'Suggestion B']);
    });

    it('should parse suggestions separated by hyphens', async () => {
        const openAIResponse = '- Idea 1\n- Idea 2';
        mockCallOpenAI_for_generateSuggestions.mockResolvedValue(openAIResponse);
        const result = await generateSuggestions(sampleConversation, mockOpenAIServiceInstance_for_generateSuggestions);
        expect(result).toEqual(['Idea 1', 'Idea 2']);
    });

    it('should parse suggestions separated by double newlines', async () => {
        const openAIResponse = 'Suggestion X\n\nSuggestion Y';
        mockCallOpenAI_for_generateSuggestions.mockResolvedValue(openAIResponse);
        const result = await generateSuggestions(sampleConversation, mockOpenAIServiceInstance_for_generateSuggestions);
        expect(result).toEqual(['Suggestion X', 'Suggestion Y']);
    });

    it('should correctly trim whitespace and remove list markers', async () => {
        const openAIResponse = '  1.  Spaced out suggestion 1  \n*   Another one here \n -  Final one.  ';
        mockCallOpenAI_for_generateSuggestions.mockResolvedValue(openAIResponse);
        const result = await generateSuggestions(sampleConversation, mockOpenAIServiceInstance_for_generateSuggestions);
        expect(result).toEqual(['Spaced out suggestion 1', 'Another one here', 'Final one.']);
    });

    it('should filter out very short or very long suggestions', async () => {
        const openAIResponse = 'Ok\nThis is a valid suggestion.\nA very long suggestion that exceeds the maximum length of five hundred characters. A very long suggestion that exceeds the maximum length of five hundred characters. A very long suggestion that exceeds the maximum length of five hundred characters. A very long suggestion that exceeds the maximum length of five hundred characters. A very long suggestion that exceeds the maximum length of five hundred characters. A very long suggestion that exceeds the maximum length of five hundred characters. A very long suggestion that exceeds the maximum length of five hundred characters. A very long suggestion that exceeds the maximum length of five hundred characters. A very long suggestion that exceeds the maximum length of five hundred characters. A very long suggestion that exceeds the maximum length of five hundred characters. Too long!';
        mockCallOpenAI_for_generateSuggestions.mockResolvedValue(openAIResponse);
        const result = await generateSuggestions(sampleConversation, mockOpenAIServiceInstance_for_generateSuggestions);
        // 'Ok' is < 5 characters, so it's filtered out.
        // The long string is > 500 characters, so it's filtered out.
        expect(result).toEqual(['This is a valid suggestion.']);
    });

    it('should return an empty array if OpenAI response is empty or yields no valid suggestions', async () => {
        mockCallOpenAI_for_generateSuggestions.mockResolvedValue('');
        let result = await generateSuggestions(sampleConversation, mockOpenAIServiceInstance_for_generateSuggestions);
        expect(result).toEqual([]);

        mockCallOpenAI_for_generateSuggestions.mockResolvedValue('1. No\n2. Bad'); // All too short
        result = await generateSuggestions(sampleConversation, mockOpenAIServiceInstance_for_generateSuggestions);
        expect(result).toEqual([]);
    });

    // Consider adding a test for when callOpenAI itself throws an error, though the current SUT doesn't explicitly catch it.
    // If it did, we'd test that. For now, an error from callOpenAI would propagate.
}); 