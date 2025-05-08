import { updateMessageWithImageDescription } from '../analyzeController'; // Adjust path as needed
import { supabaseAdmin } from '../../services/supabaseService';

// Mock Supabase client
const mockUpdate = jest.fn();
const mockEq = jest.fn();

jest.mock('../../services/supabaseService', () => ({
    supabaseAdmin: {
        from: jest.fn().mockImplementation((tableName: string) => {
            if (tableName === 'messages') {
                return {
                    update: mockUpdate.mockReturnThis(), // Return `this` to chain .eq()
                    eq: mockEq, // .eq is called on the result of update()
                };
            }
            return {
                update: jest.fn().mockReturnThis(),
                eq: jest.fn(),
            };
        }),
    },
}));

describe('updateMessageWithImageDescription', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUpdate.mockClear();
        mockEq.mockClear();
        // Ensure eq also returns a promise-like structure if needed, or the error/data directly
        // For `update`, the final call (e.g. .eq()) usually returns the promise.
    });

    const messageId = 'test-message-id';
    const imageDescription = 'A beautiful sunset over the mountains.';

    it('should call Supabase update with correct parameters and return true on success', async () => {
        // Mock the chain: supabase.from('messages').update(...).eq(...)
        // update() itself might not need to resolve a promise if eq() does.
        // Let's assume .eq() is the final part of the chain returning the promise for update operations.
        mockEq.mockResolvedValue({ error: null, data: [{ id: messageId }] }); // Simulate successful update

        const result = await updateMessageWithImageDescription(supabaseAdmin, messageId, imageDescription);

        expect(supabaseAdmin!.from).toHaveBeenCalledWith('messages');
        expect(mockUpdate).toHaveBeenCalledWith({ image_description: imageDescription });
        expect(mockEq).toHaveBeenCalledWith('id', messageId);
        expect(result).toBe(true);
    });

    it('should return false if Supabase update fails', async () => {
        const dbError = new Error('Supabase update failed');
        mockEq.mockResolvedValue({ error: dbError, data: null }); // Simulate update failure

        const result = await updateMessageWithImageDescription(supabaseAdmin, messageId, imageDescription);

        expect(supabaseAdmin!.from).toHaveBeenCalledWith('messages');
        expect(mockUpdate).toHaveBeenCalledWith({ image_description: imageDescription });
        expect(mockEq).toHaveBeenCalledWith('id', messageId);
        expect(result).toBe(false);
    });

    it('should correctly chain calls if update returns a chainable object', async () => {
        // This test primarily ensures the mock setup is correct for chaining.
        mockUpdate.mockReturnThis(); // Explicitly ensure update is chainable to eq
        mockEq.mockResolvedValue({ error: null });

        await updateMessageWithImageDescription(supabaseAdmin, messageId, imageDescription);
        expect(mockUpdate).toHaveBeenCalledTimes(1);
        expect(mockEq).toHaveBeenCalledTimes(1);
    });
}); 