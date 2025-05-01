import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';
import { OpenAIService } from '../services/openaiService';
import { supabaseAdmin } from '../services/supabaseService';
import systemPrompt from '../prompts/systemPrompt';
import userPrompt from '../prompts/userPrompt';
// Import OpenAI types if available
import type { ChatCompletionMessageParam } from 'openai/resources/chat';

const openaiApiKey = process.env.OPENAI_API_KEY as string;
const openaiClient = new OpenAIService(openaiApiKey);

// Type definitions
interface AnalyzeRequestBody {
    historyJson?: string;
    newMessageText?: string;
    conversationId?: string;
}

interface UploadedFile {
    originalname: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
}

interface MessageRecord {
    id: string;
    conversation_id: string;
    sender: string;
    content: string | null;
    image_description?: string;
}

interface ImageRecord {
    message_id: string;
    storage_path: string;
    filename: string;
    content_type: string;
    filesize: number;
}

function parseAnalyzeRequest(req: Request): { history: any[]; newMessageText: string; conversationId: string; files: UploadedFile[] } {
    const { historyJson, newMessageText, conversationId } = (req.body || {}) as AnalyzeRequestBody;
    let history: any[] = [];
    try {
        history = historyJson ? JSON.parse(historyJson) : [];
    } catch (e) {
        throw new Error('Invalid history JSON');
    }
    if (!newMessageText || !conversationId) {
        throw new Error('newMessageText and conversationId are required');
    }
    const files: UploadedFile[] = (req.files as UploadedFile[]) || [];
    return { history, newMessageText, conversationId, files };
}

async function getUserIdFromAuthHeader(authHeader: string | undefined, supabase: any): Promise<string | null> {
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const userAccessToken = authHeader.split(' ')[1];
        try {
            if (supabase) {
                const { data: { user }, error: userError } = await supabase.auth.getUser(userAccessToken);
                if (!userError && user) {
                    return user.id;
                }
            }
        } catch (e) {
            // Optionally log error
        }
    }
    return null;
}

async function saveMessageStub(supabase: any, conversationId: string, newMessageText: string): Promise<MessageRecord> {
    const messageData = {
        conversation_id: conversationId,
        sender: 'user',
        content: newMessageText || null,
    };
    const { data: newMessageRecord, error: messageError } = await supabase!.from('messages').insert(messageData).select().single();
    if (messageError) {
        if (messageError.code === '23503') {
            throw new Error(`Invalid conversation ID: ${conversationId}. Cannot save message.`);
        }
        throw new Error(`Failed to save message stub: ${messageError.message}`);
    }
    return newMessageRecord as MessageRecord;
}

async function uploadFilesToStorage(supabase: any, files: UploadedFile[], savedMessage: MessageRecord, userId: string | null): Promise<{ imageRecords: ImageRecord[]; imageUrlsForOpenAI: string[]; imageUrlsForFrontend: string[] }> {
    let imageRecords: ImageRecord[] = [];
    let imageUrlsForOpenAI: string[] = [];
    let imageUrlsForFrontend: string[] = [];
    for (const file of files) {
        const fileExt = path.extname(file.originalname);
        const fileNameWithoutExt = path.basename(file.originalname, fileExt);
        const safeFileNameBase = fileNameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '_');
        const uniqueFileName = `${safeFileNameBase}-${uuidv4()}${fileExt}`;
        const storageDirPath = userId ? `public/${userId}/${savedMessage.id}` : `public/${savedMessage.id}`;
        const storagePath = `${storageDirPath}/${uniqueFileName}`;
        const { data: uploadData, error: uploadError } = await supabase!.storage.from('chat-images').upload(storagePath, file.buffer, {
            contentType: file.mimetype,
            cacheControl: '3600',
        });
        if (uploadError) {
            continue;
        }
        const { data: urlData } = supabase!.storage.from('chat-images').getPublicUrl(uploadData.path);
        if (urlData?.publicUrl) {
            imageUrlsForOpenAI.push(urlData.publicUrl);
            imageUrlsForFrontend.push(urlData.publicUrl);
        }
        imageRecords.push({
            message_id: savedMessage.id,
            storage_path: uploadData.path,
            filename: file.originalname,
            content_type: file.mimetype,
            filesize: file.size
        });
    }
    return { imageRecords, imageUrlsForOpenAI, imageUrlsForFrontend };
}

async function saveImageRecords(supabase: any, imageRecords: ImageRecord[]): Promise<void> {
    if (imageRecords.length > 0) {
        const { error: imageDbError } = await supabase!.from('ChatMessageImages').insert(imageRecords);
        if (imageDbError) {
            throw new Error('Failed to save image references: ' + imageDbError.message);
        }
    }
}

async function generateNickname(newMessageText: string, openaiInstance: OpenAIService = openaiClient): Promise<string> {
    const nicknamePrompt: ChatCompletionMessageParam[] = [{
        role: 'user',
        content: `Based on the following initial message, suggest a short, catchy, SFW nickname for the person being discussed:\n\n"${newMessageText}"\n\nNickname:`
    }];
    const result = await openaiInstance.callOpenAI(nicknamePrompt, 20);
    return result.trim() || 'Chat Pal';
}

async function generateImageDescriptionAndNickname(finalUserMessageContent: any[], openaiInstance: OpenAIService = openaiClient): Promise<{ nickname: string; imageDescription: string }> {
    const descriptionPromptContent = [...finalUserMessageContent];
    descriptionPromptContent.unshift({ type: 'text', text: 'Describe the image(s) briefly for context in a chat analysis. Focus on the people, setting, and overall vibe. Then, suggest a short, catchy, SFW nickname for the girl based *only* on the image(s).' });
    const descriptionPrompt: ChatCompletionMessageParam[] = [{
        role: 'user',
        content: descriptionPromptContent as any // OpenAI SDK expects string, but our code uses array for multimodal; keep as any for now
    }];
    const descriptionAndNickname = await openaiInstance.callOpenAI(descriptionPrompt, 100);
    const lines = descriptionAndNickname.split('\n');
    let parsedNickname = lines.find(line => line.toLowerCase().startsWith('nickname:'));
    const generatedNickname = parsedNickname ? parsedNickname.replace(/nickname:/i, '').trim() : lines.pop()?.trim() || '';
    const nickname = generatedNickname || 'Mystery Girl';
    const generatedImageDescription = lines.filter(line => !line.toLowerCase().startsWith('nickname:') && line.trim() !== nickname).join('\n').trim();
    const imageDescription = generatedImageDescription || 'Image(s) received.';
    return { nickname, imageDescription };
}

async function generateImageDescription(finalUserMessageContent: any[], openaiInstance: OpenAIService = openaiClient): Promise<string> {
    const descPromptContentSubsequent = [...finalUserMessageContent];
    descPromptContentSubsequent.unshift({ type: 'text', text: 'Describe the image(s) briefly for context in a chat analysis. Focus on the people, setting, and overall vibe.' });
    const descriptionPromptSubsequent: ChatCompletionMessageParam[] = [{
        role: 'user',
        content: descPromptContentSubsequent as any // see above note
    }];
    try {
        let generatedImageDescription = await openaiInstance.callOpenAI(descriptionPromptSubsequent, 100);
        return generatedImageDescription.trim() || 'Image(s) analyzed.';
    } catch (descError) {
        return 'Error analyzing image(s).';
    }
}

async function updateMessageWithImageDescription(supabase: any, messageId: string, imageDescription: string): Promise<boolean> {
    const { error: updateError } = await supabase!.from('messages').update({ image_description: imageDescription }).eq('id', messageId);
    return !updateError;
}

async function generateSuggestions(conversation: any[], openaiInstance: OpenAIService = openaiClient): Promise<string[]> {
    const suggestionText = await openaiInstance.callOpenAI(conversation, 300);
    return suggestionText.split(/\n\d\.\s+|\n\*\s+|\n-\s+|\n\n/)
        .map(s => s.replace(/^\d\.\s*/, '').replace(/^[\*-]\s*/, '').trim())
        .filter(s => s.length > 5 && s.length < 500);
}

export async function analyze(req: Request, res: Response): Promise<void> {
    try {
        // --- Extract Auth Token ---
        const userId = await getUserIdFromAuthHeader(req.headers.authorization, supabaseAdmin);
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized: user authentication required.' });
            return;
        }

        // --- Extract Text and Files ---
        let history: any[], newMessageText: string, conversationId: string, files: UploadedFile[];
        try {
            ({ history, newMessageText, conversationId, files } = parseAnalyzeRequest(req));
        } catch (err: any) {
            res.status(400).json({ error: err.message });
            return;
        }

        if ((!newMessageText || newMessageText.trim() === '') && files.length === 0) {
            res.status(400).json({ error: 'New message content (text or image files) is required.' });
            return;
        }
        if (!supabaseAdmin) {
            res.status(500).json({ error: 'Backend Supabase client not configured.' });
            return;
        }

        let savedMessage: MessageRecord | null = null;
        let imageRecords: ImageRecord[] = [];
        let imageUrlsForOpenAI: string[] = [];
        let imageUrlsForFrontend: string[] = [];

        // --- Save the Message Stub (without AI response yet) ---
        try {
            savedMessage = await saveMessageStub(supabaseAdmin, conversationId, newMessageText);
        } catch (dbError: any) {
            res.status(500).json({ error: 'Database operation failed.', details: dbError.message });
            return;
        }

        // --- Upload Files to Supabase Storage & Prepare Records ---
        if (files.length > 0 && savedMessage) {
            const uploadResult = await uploadFilesToStorage(supabaseAdmin, files, savedMessage, userId);
            imageRecords = uploadResult.imageRecords;
            imageUrlsForOpenAI = uploadResult.imageUrlsForOpenAI;
            imageUrlsForFrontend = uploadResult.imageUrlsForFrontend;
            try {
                await saveImageRecords(supabaseAdmin, imageRecords);
            } catch (imageDbError: any) {
                res.status(500).json({ error: imageDbError.message });
                return;
            }
        }

        // --- Prepare for OpenAI Analysis ---
        let generatedNickname: string | null = null;
        let generatedImageDescription: string | null = null;
        let finalUserMessageContent: any[] = [];
        const isInitialUserMessage = !history || history.filter((msg: any) => msg.role === 'user').length === 0;
        if (newMessageText && newMessageText.trim() !== '') {
            finalUserMessageContent.push({ type: 'text', text: newMessageText });
        }
        if (imageUrlsForOpenAI.length > 0) {
            if (finalUserMessageContent.length === 0) {
                finalUserMessageContent.push({ type: 'text', text: '[Image(s) provided]' });
            }
            imageUrlsForOpenAI.forEach(url => {
                finalUserMessageContent.push({
                    type: 'image_url',
                    image_url: { url: url }
                });
            });
        }
        if (isInitialUserMessage && finalUserMessageContent.length > 0) {
            if (imageUrlsForOpenAI.length > 0) {
                const { nickname, imageDescription } = await generateImageDescriptionAndNickname(finalUserMessageContent);
                generatedNickname = nickname;
                generatedImageDescription = imageDescription;
            } else {
                generatedNickname = await generateNickname(newMessageText);
            }
        } else if (finalUserMessageContent.length > 0 && imageUrlsForOpenAI.length > 0) {
            generatedNickname = null;
            generatedImageDescription = await generateImageDescription(finalUserMessageContent);
        }
        if (savedMessage && generatedImageDescription) {
            await updateMessageWithImageDescription(supabaseAdmin, savedMessage.id, generatedImageDescription);
            savedMessage.image_description = generatedImageDescription;
        }
        // --- Refactored prompt construction ---
        // Stringify history for userPrompt
        const historyString = (history || []).map((msg: any) => {
            return msg.imageDescription
                ? `${msg.content}\n[Image Description: ${msg.imageDescription}]`
                : msg.content;
        }).join('\n---\n');
        const prompt = [
            systemPrompt(),
            userPrompt({
                history: historyString,
                message: newMessageText,
                imageDescription: generatedImageDescription ?? undefined
            })
        ].join('\n\n');

        // --- Stream OpenAI response to client ---
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        let aiResponseBuffer = '';
        try {
            await openaiClient.streamChatCompletion(prompt, (text) => {
                aiResponseBuffer += text;
                res.write(`data: ${JSON.stringify({ text, done: false })}\n\n`);
            });
            res.write(`data: ${JSON.stringify({ text: '', done: true })}\n\n`);
            // Save the full AI message to the database
            if (savedMessage && aiResponseBuffer.trim()) {
                try {
                    await supabaseAdmin.from('messages').insert({
                        conversation_id: savedMessage.conversation_id,
                        sender: 'ai',
                        content: aiResponseBuffer.trim(),
                    });
                } catch (saveErr) {
                    // Log but do not interrupt the client
                    console.error('Failed to save AI message:', saveErr);
                }
            }
            res.end();
        } catch (err) {
            res.write(`data: ${JSON.stringify({ text: 'Error streaming response', done: true })}\n\n`);
            res.end();
        }
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to analyze message', details: error.message });
    }
}

export { parseAnalyzeRequest, generateNickname, getUserIdFromAuthHeader, saveMessageStub, uploadFilesToStorage, saveImageRecords, updateMessageWithImageDescription, generateImageDescriptionAndNickname, generateImageDescription, generateSuggestions };