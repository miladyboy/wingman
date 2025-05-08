import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { uploadFilesToStorage } from '../analyzeController'; // Adjust path as needed
import { supabaseAdmin } from '../../services/supabaseService'; // Assuming this is the correct path

// Mock dependencies
jest.mock('uuid');
jest.mock('path');

// Define these outside the jest.mock for clarity and to allow per-test configuration
const mockUploadFn = jest.fn();
const mockGetPublicUrlFn = jest.fn();

jest.mock('../../services/supabaseService', () => ({
    supabaseAdmin: { // This mocks the supabaseAdmin export
        storage: { // This mocks supabaseAdmin.storage
            from: jest.fn().mockImplementation((bucketName: string) => {
                // This mockImplementation is for supabaseAdmin.storage.from()
                // It should return an object that has .upload and .getPublicUrl methods
                if (bucketName === 'chat-images') {
                    return {
                        upload: mockUploadFn,
                        getPublicUrl: mockGetPublicUrlFn,
                    };
                }
                // Fallback for other bucket names if necessary
                return {
                    upload: jest.fn().mockRejectedValue(new Error(`Unexpected bucket: ${bucketName}`)),
                    getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: '' } }),
                };
            }),
        },
    },
}));

const mockedUuidv4 = uuidv4 as jest.Mock;
const mockedPath = path as jest.Mocked<typeof path>;
// const mockedSupabaseStorage = supabaseAdmin.storage as jest.Mocked<typeof supabaseAdmin.storage>; // No longer needed in this form

describe('uploadFilesToStorage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUploadFn.mockClear();
        mockGetPublicUrlFn.mockClear();

        // Explicitly clear the .from mock from the supabaseAdmin.storage mock
        if (supabaseAdmin && supabaseAdmin.storage && typeof (supabaseAdmin.storage.from as jest.Mock).mockClear === 'function') {
            (supabaseAdmin.storage.from as jest.Mock).mockClear();
        }

        // Default mock implementations for path and uuid
        mockedPath.extname.mockImplementation((p) => '.' + p.split('.').pop());
        mockedPath.basename.mockImplementation((p, ext) => p.substring(0, p.length - (ext ? ext.length : 0)));
        mockedUuidv4.mockReturnValue('test-uuid');
    });

    const mockFiles = [
        { originalname: 'testImage.png', mimetype: 'image/png', buffer: Buffer.from('test'), size: 4 },
        { originalname: 'another-image.jpg', mimetype: 'image/jpeg', buffer: Buffer.from('img'), size: 3 },
    ];

    const mockSavedMessage = {
        id: 'message-123',
        conversation_id: 'conv-456',
        sender: 'user',
        content: 'Hello',
    };

    const mockUserId = 'user-abc';

    it('should upload files and return correct records and URLs when userId is provided', async () => {
        mockUploadFn
            .mockResolvedValueOnce({ data: { path: 'public/user-abc/message-123/testImage-test-uuid.png' }, error: null })
            .mockResolvedValueOnce({ data: { path: 'public/user-abc/message-123/another-image-test-uuid.jpg' }, error: null });
        mockGetPublicUrlFn
            .mockReturnValueOnce({ data: { publicUrl: 'http://supabase.com/public/user-abc/message-123/testImage-test-uuid.png' } })
            .mockReturnValueOnce({ data: { publicUrl: 'http://supabase.com/public/user-abc/message-123/another-image-test-uuid.jpg' } });


        const result = await uploadFilesToStorage(supabaseAdmin, mockFiles, mockSavedMessage, mockUserId);

        expect(supabaseAdmin!.storage.from).toHaveBeenCalledWith('chat-images');
        expect(supabaseAdmin!.storage.from).toHaveBeenCalledTimes(mockFiles.length * 2);
        expect(mockUploadFn).toHaveBeenCalledTimes(mockFiles.length);
        expect(mockUploadFn).toHaveBeenNthCalledWith(1,
            'public/user-abc/message-123/testImage-test-uuid.png',
            mockFiles[0].buffer,
            { contentType: mockFiles[0].mimetype, cacheControl: '3600' }
        );
        expect(mockUploadFn).toHaveBeenNthCalledWith(2,
            'public/user-abc/message-123/another-image-test-uuid.jpg',
            mockFiles[1].buffer,
            { contentType: mockFiles[1].mimetype, cacheControl: '3600' }
        );

        expect(mockGetPublicUrlFn).toHaveBeenCalledTimes(mockFiles.length);
        expect(result.imageUrlsForOpenAI).toEqual([
            'http://supabase.com/public/user-abc/message-123/testImage-test-uuid.png',
            'http://supabase.com/public/user-abc/message-123/another-image-test-uuid.jpg',
        ]);
        expect(result.imageUrlsForFrontend).toEqual(result.imageUrlsForOpenAI);
        expect(result.imageRecords).toHaveLength(2);
        expect(result.imageRecords[0]).toEqual(expect.objectContaining({
            message_id: 'message-123',
            storage_path: 'public/user-abc/message-123/testImage-test-uuid.png',
            filename: 'testImage.png',
            content_type: 'image/png',
            filesize: 4,
        }));
    });

    it('should upload files and return correct records and URLs when userId is null', async () => {
        mockUploadFn
            .mockResolvedValueOnce({ data: { path: 'public/message-123/testImage-test-uuid.png' }, error: null });
        mockGetPublicUrlFn
            .mockReturnValueOnce({ data: { publicUrl: 'http://supabase.com/public/message-123/testImage-test-uuid.png' } });

        const result = await uploadFilesToStorage(supabaseAdmin, [mockFiles[0]], mockSavedMessage, null);

        expect(supabaseAdmin!.storage.from).toHaveBeenCalledWith('chat-images');
        expect(mockUploadFn).toHaveBeenCalledWith(
            'public/message-123/testImage-test-uuid.png',
            mockFiles[0].buffer,
            { contentType: mockFiles[0].mimetype, cacheControl: '3600' }
        );
        expect(result.imageUrlsForOpenAI).toEqual(['http://supabase.com/public/message-123/testImage-test-uuid.png']);
        expect(result.imageRecords[0].storage_path).toBe('public/message-123/testImage-test-uuid.png');
    });

    it('should handle file names with special characters safely', async () => {
        const specialFile = [{ originalname: 'te$t*Im&ge!.png', mimetype: 'image/png', buffer: Buffer.from('test'), size: 4 }];
        mockUploadFn
            .mockResolvedValueOnce({ data: { path: 'public/user-abc/message-123/te_t_Im_ge_-test-uuid.png' }, error: null });
        mockGetPublicUrlFn
            .mockReturnValueOnce({ data: { publicUrl: 'http://supabase.com/public/user-abc/message-123/te_t_Im_ge_-test-uuid.png' } });

        await uploadFilesToStorage(supabaseAdmin, specialFile, mockSavedMessage, mockUserId);

        expect(supabaseAdmin!.storage.from).toHaveBeenCalledWith('chat-images');
        expect(mockedPath.basename).toHaveBeenCalledWith('te$t*Im&ge!.png', '.png');
        // The analyzeController uses: safeFileNameBase = fileNameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '_');
        // So, 'te$t*Im&ge!' becomes 'te_t_Im_ge_'
        expect(mockUploadFn).toHaveBeenCalledWith(
            expect.stringContaining('te_t_Im_ge_-test-uuid.png'), // Check that the sanitized base name is used
            specialFile[0].buffer,
            expect.anything()
        );
    });

    it('should continue if some file uploads fail', async () => {
        mockUploadFn
            .mockResolvedValueOnce({ data: null, error: new Error('Upload failed for file 1') }) // First upload fails
            .mockResolvedValueOnce({ data: { path: 'public/user-abc/message-123/another-image-test-uuid.jpg' }, error: null }); // Second succeeds
        mockGetPublicUrlFn // This will only be called for the second, successful upload
            .mockReturnValueOnce({ data: { publicUrl: 'http://supabase.com/public/user-abc/message-123/another-image-test-uuid.jpg' } });


        const result = await uploadFilesToStorage(supabaseAdmin, mockFiles, mockSavedMessage, mockUserId);
        expect(supabaseAdmin!.storage.from).toHaveBeenCalledWith('chat-images');
        expect(supabaseAdmin!.storage.from).toHaveBeenCalledTimes(3);
        expect(mockUploadFn).toHaveBeenCalledTimes(mockFiles.length);
        expect(mockGetPublicUrlFn).toHaveBeenCalledTimes(1); // Only called for the successful upload
        expect(result.imageUrlsForOpenAI).toEqual(['http://supabase.com/public/user-abc/message-123/another-image-test-uuid.jpg']);
        expect(result.imageRecords).toHaveLength(1);
        expect(result.imageRecords[0].filename).toBe('another-image.jpg');
    });

    it('should handle cases where getPublicUrl does not return a publicUrl', async () => {
        mockUploadFn
            .mockResolvedValueOnce({ data: { path: 'public/user-abc/message-123/testImage-test-uuid.png' }, error: null });
        mockGetPublicUrlFn
            .mockReturnValueOnce({ data: { publicUrl: null as any } }); // Simulate null publicUrl

        const result = await uploadFilesToStorage(supabaseAdmin, [mockFiles[0]], mockSavedMessage, mockUserId);

        expect(supabaseAdmin!.storage.from).toHaveBeenCalledWith('chat-images');
        expect(result.imageUrlsForOpenAI).toEqual([]);
        expect(result.imageUrlsForFrontend).toEqual([]);
        expect(result.imageRecords).toHaveLength(1); // Record is still created
        expect(result.imageRecords[0].filename).toBe('testImage.png');
    });


    it('should return empty arrays if no files are provided', async () => {
        const result = await uploadFilesToStorage(supabaseAdmin, [], mockSavedMessage, mockUserId);
        expect(result.imageRecords).toEqual([]);
        expect(result.imageUrlsForOpenAI).toEqual([]);
        expect(result.imageUrlsForFrontend).toEqual([]);
        expect(supabaseAdmin!.storage.from).not.toHaveBeenCalled(); // if no files, from() isn't called
        expect(mockUploadFn).not.toHaveBeenCalled();
    });
}); 