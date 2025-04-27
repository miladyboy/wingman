const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { callOpenAI } = require('../services/openaiService');
const { supabaseAdmin } = require('../services/supabaseService');

function parseAnalyzeRequest(req) {
    const { historyJson, newMessageText, conversationId } = req.body;
    let history = [];
    try {
        history = historyJson ? JSON.parse(historyJson) : [];
    } catch (e) {
        throw new Error('Invalid history JSON');
    }
    const files = req.files || [];
    return { history, newMessageText, conversationId, files };
}

async function getUserIdFromAuthHeader(authHeader, supabaseAdmin) {
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const userAccessToken = authHeader.split(' ')[1];
        try {
            if (supabaseAdmin) {
                const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(userAccessToken);
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

async function saveMessageStub(conversationId, newMessageText) {
    const messageData = {
        conversation_id: conversationId,
        sender: 'user',
        content: newMessageText || null,
    };
    const { data: newMessageRecord, error: messageError } = await supabaseAdmin
        .from('messages')
        .insert(messageData)
        .select()
        .single();
    if (messageError) {
        if (messageError.code === '23503') {
            throw new Error(`Invalid conversation ID: ${conversationId}. Cannot save message.`);
        }
        throw new Error(`Failed to save message stub: ${messageError.message}`);
    }
    return newMessageRecord;
}

async function uploadFilesToStorage(files, savedMessage, userId) {
    let imageRecords = [];
    let imageUrlsForOpenAI = [];
    let imageUrlsForFrontend = [];
    for (const file of files) {
        const fileExt = path.extname(file.originalname);
        const fileNameWithoutExt = path.basename(file.originalname, fileExt);
        const safeFileNameBase = fileNameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '_');
        const uniqueFileName = `${safeFileNameBase}-${uuidv4()}${fileExt}`;
        const storageDirPath = userId ? `public/${userId}/${savedMessage.id}` : `public/${savedMessage.id}`;
        const storagePath = `${storageDirPath}/${uniqueFileName}`;
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from('chat-images')
            .upload(storagePath, file.buffer, {
                contentType: file.mimetype,
                cacheControl: '3600',
            });
        if (uploadError) {
            continue;
        }
        const { data: urlData } = supabaseAdmin.storage
            .from('chat-images')
            .getPublicUrl(uploadData.path);
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

async function saveImageRecords(imageRecords) {
    if (imageRecords.length > 0) {
        const { error: imageDbError } = await supabaseAdmin
            .from('ChatMessageImages')
            .insert(imageRecords);
        if (imageDbError) {
            throw new Error('Failed to save image references: ' + imageDbError.message);
        }
    }
}

async function generateNickname(newMessageText) {
    const nicknamePrompt = [{
        role: "user",
        content: `Based on the following initial message, suggest a short, catchy, SFW nickname for the person being discussed:\n\n"${newMessageText}"\n\nNickname:`
    }];
    const result = await callOpenAI(nicknamePrompt, 20);
    return result.trim() || "Chat Pal";
}

async function generateImageDescriptionAndNickname(finalUserMessageContent) {
    const descriptionPromptContent = [...finalUserMessageContent];
    descriptionPromptContent.unshift({ type: "text", text: "Describe the image(s) briefly for context in a chat analysis. Focus on the people, setting, and overall vibe. Then, suggest a short, catchy, SFW nickname for the girl based *only* on the image(s)." });
    const descriptionPrompt = [{
        role: "user",
        content: descriptionPromptContent
    }];
    const descriptionAndNickname = await callOpenAI(descriptionPrompt, 100);
    const lines = descriptionAndNickname.split('\n');
    let parsedNickname = lines.find(line => line.toLowerCase().startsWith('nickname:'));
    const generatedNickname = parsedNickname ? parsedNickname.replace(/nickname:/i, '').trim() : lines.pop().trim();
    const nickname = generatedNickname || "Mystery Girl";
    const generatedImageDescription = lines.filter(line => !line.toLowerCase().startsWith('nickname:') && line.trim() !== nickname).join('\n').trim();
    const imageDescription = generatedImageDescription || "Image(s) received.";
    return { nickname, imageDescription };
}

async function generateImageDescription(finalUserMessageContent) {
    const descPromptContentSubsequent = [...finalUserMessageContent];
    descPromptContentSubsequent.unshift({ type: "text", text: "Describe the image(s) briefly for context in a chat analysis. Focus on the people, setting, and overall vibe." });
    const descriptionPromptSubsequent = [{
        role: "user",
        content: descPromptContentSubsequent
    }];
    try {
        let generatedImageDescription = await callOpenAI(descriptionPromptSubsequent, 100);
        return generatedImageDescription.trim() || "Image(s) analyzed.";
    } catch (descError) {
        return "Error analyzing image(s).";
    }
}

async function updateMessageWithImageDescription(messageId, imageDescription) {
    const { error: updateError } = await supabaseAdmin
        .from('messages')
        .update({ image_description: imageDescription })
        .eq('id', messageId);
    return !updateError;
}

async function generateSuggestions(conversation) {
    const suggestionText = await callOpenAI(conversation, 300);
    return suggestionText.split(/\n\d\.\s+|\n\*\s+|\n-\s+|\n\n/)
        .map(s => s.replace(/^\d\.\s*/, '').replace(/^[\*-]\s*/, '').trim())
        .filter(s => s.length > 5 && s.length < 500);
}

exports.analyze = async (req, res) => {
    try {
        // --- Extract Auth Token ---
        const userId = await getUserIdFromAuthHeader(req.headers.authorization, supabaseAdmin);

        // --- Extract Text and Files ---
        let history, newMessageText, conversationId, files;
        try {
            ({ history, newMessageText, conversationId, files } = parseAnalyzeRequest(req));
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }

        if ((!newMessageText || newMessageText.trim() === '') && files.length === 0) {
            return res.status(400).json({ error: 'New message content (text or image files) is required.' });
        }
        if (!supabaseAdmin) {
            return res.status(500).json({ error: 'Backend Supabase client not configured.' });
        }

        let savedMessage = null;
        let imageRecords = [];
        let imageUrlsForOpenAI = [];
        let imageUrlsForFrontend = [];

        // --- Save the Message Stub (without AI response yet) ---
        try {
            savedMessage = await saveMessageStub(conversationId, newMessageText);
        } catch (dbError) {
            return res.status(500).json({ error: 'Database operation failed.', details: dbError.message });
        }

        // --- Upload Files to Supabase Storage & Prepare Records ---
        if (files.length > 0 && savedMessage) {
            const uploadResult = await uploadFilesToStorage(files, savedMessage, userId);
            imageRecords = uploadResult.imageRecords;
            imageUrlsForOpenAI = uploadResult.imageUrlsForOpenAI;
            imageUrlsForFrontend = uploadResult.imageUrlsForFrontend;
            try {
                await saveImageRecords(imageRecords);
            } catch (imageDbError) {
                return res.status(500).json({ error: imageDbError.message });
            }
        }

        // --- Prepare for OpenAI Analysis ---
        let generatedNickname = null;
        let generatedImageDescription = null;
        let finalUserMessageContent = [];
        const isInitialUserMessage = !history || history.filter(msg => msg.role === 'user').length === 0;
        if (newMessageText && newMessageText.trim() !== '') {
            finalUserMessageContent.push({ type: "text", text: newMessageText });
        }
        if (imageUrlsForOpenAI.length > 0) {
            if (finalUserMessageContent.length === 0) {
                finalUserMessageContent.push({ type: "text", text: "[Image(s) provided]" });
            }
            imageUrlsForOpenAI.forEach(url => {
                finalUserMessageContent.push({
                    type: "image_url",
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
            await updateMessageWithImageDescription(savedMessage.id, generatedImageDescription);
            savedMessage.image_description = generatedImageDescription;
        }
        const conversation = [
            {
                role: "system",
                content: "You are a flirty wingman AI. Your goal is to help the user craft witty, engaging, and flirty replies in their conversations. Analyze the provided chat history and the latest message (including any image descriptions or context from images provided via URL). Suggest 2-3 distinct replies. Keep the tone appropriate to the conversation's vibe. Be aware of context and adapt."
            },
            ...(history || []).map(msg => ({
                role: msg.role,
                content: msg.imageDescription ? `${msg.content}\n[Image Description: ${msg.imageDescription}]` : msg.content
            })),
            {
                role: "user",
                content: finalUserMessageContent
            }
        ];
        const suggestions = await generateSuggestions(conversation);
        const responsePayload = {
            suggestions,
            nickname: generatedNickname,
            savedMessage: savedMessage,
            imageUrls: imageUrlsForFrontend
        };
        res.json(responsePayload);
    } catch (error) {
        res.status(500).json({ error: 'Failed to analyze message', details: error.message });
    }
}; 