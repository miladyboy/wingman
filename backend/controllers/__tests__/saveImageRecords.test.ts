import { saveImageRecords } from '../analyzeController'; // Adjust path as needed
import { supabaseAdmin } from '../../services/supabaseService';

// Mock Supabase client
const mockInsert = jest.fn();
jest.mock('../../services/supabaseService', () => ({
    supabaseAdmin: {
        from: jest.fn().mockImplementation((tableName: string) => {
            if (tableName === 'ChatMessageImages') {
                return {
                    insert: mockInsert,
                };
            }
            return {
                insert: jest.fn(), // Default mock for other tables
            };
        }),
    },
}));

// Define a type for ImageRecord matching the one in analyzeController.ts
// This helps with type safety in tests.
interface ImageRecord {
    message_id: string;
    storage_path: string;
    filename: string;
    content_type: string;
    filesize: number;
}

describe('saveImageRecords', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockInsert.mockReset(); // Reset mock before each test
    });

    const sampleImageRecords: ImageRecord[] = [
        {
            message_id: 'msg1',
            storage_path: 'path/to/image1.png',
            filename: 'image1.png',
            content_type: 'image/png',
            filesize: 1024,
        },
        {
            message_id: 'msg2',
            storage_path: 'path/to/image2.jpg',
            filename: 'image2.jpg',
            content_type: 'image/jpeg',
            filesize: 2048,
        },
    ];

    it('should attempt to insert image records if records array is not empty', async () => {
        mockInsert.mockResolvedValue({ error: null, data: sampleImageRecords });

        await saveImageRecords(supabaseAdmin, sampleImageRecords);

        expect(supabaseAdmin!.from).toHaveBeenCalledWith('ChatMessageImages');
        expect(mockInsert).toHaveBeenCalledWith(sampleImageRecords);
        expect(mockInsert).toHaveBeenCalledTimes(1);
    });

    it('should not attempt to insert if records array is empty', async () => {
        await saveImageRecords(supabaseAdmin, []);

        expect(supabaseAdmin!.from).not.toHaveBeenCalled();
        expect(mockInsert).not.toHaveBeenCalled();
    });

    it('should throw an error if Supabase insert fails', async () => {
        const dbError = new Error('Supabase insert failed');
        mockInsert.mockResolvedValue({ error: dbError, data: null });

        await expect(saveImageRecords(supabaseAdmin, sampleImageRecords))
            .rejects
            .toThrow('Failed to save image references: Supabase insert failed');
        
        expect(supabaseAdmin!.from).toHaveBeenCalledWith('ChatMessageImages');
        expect(mockInsert).toHaveBeenCalledWith(sampleImageRecords);
    });

    it('should handle an empty array without errors and not call insert', async () => {
        await expect(saveImageRecords(supabaseAdmin, [])).resolves.toBeUndefined(); // or .resolves.not.toThrow();
        expect(mockInsert).not.toHaveBeenCalled();
    });
}); 