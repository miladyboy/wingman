const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { callOpenAI } = require('../services/openaiService');
const { supabaseAdmin } = require('../services/supabaseService');

exports.analyze = async (req, res) => {
    try {
        // --- Extract Auth Token ---
        const authHeader = req.headers.authorization;
        let userAccessToken = null;
        let userId = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            userAccessToken = authHeader.split(' ')[1];
            try {
                if (supabaseAdmin) {
                    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(userAccessToken);
                    if (!userError && user) {
                        userId = user.id;
                    }
                }
            } catch (e) {
                // Log and continue
            }
        }

        // --- Extract Text and Files ---
        const { historyJson, newMessageText, conversationId } = req.body;
        const history = historyJson ? JSON.parse(historyJson) : [];
        const files = req.files || [];

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
            const messageData = {
                conversation_id: conversationId,
                sender: 'user',
                content: newMessageText || null,
            };
            // if (userId) messageData.user_id = userId;
            const { data: newMessageRecord, error: messageError } = await supabaseAdmin
                .from('messages')
                .insert(messageData)
                .select()
                .single();
            if (messageError) {
                if (messageError.code === '23503') {
                     return res.status(400).json({ error: `Invalid conversation ID: ${conversationId}. Cannot save message.` });
                }
                throw new Error(`Failed to save message stub: ${messageError.message}`);
            }
            savedMessage = newMessageRecord;
        } catch (dbError) {
             return res.status(500).json({ error: 'Database operation failed.', details: dbError.message });
        }

        // --- Upload Files to Supabase Storage & Prepare Records ---
        if (files.length > 0 && savedMessage) {
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
            if (imageRecords.length > 0) {
                const { error: imageDbError } = await supabaseAdmin
                    .from('ChatMessageImages')
                    .insert(imageRecords);
                if (imageDbError) {
                    return res.status(500).json({ error: 'Failed to save image references.', details: imageDbError.message });
                }
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
                const descriptionPromptContent = [...finalUserMessageContent];
                descriptionPromptContent.unshift({ type: "text", text: "Describe the image(s) briefly for context in a chat analysis. Focus on the people, setting, and overall vibe. Then, suggest a short, catchy, SFW nickname for the girl based *only* on the image(s)." });
                const descriptionPrompt = [{
                    role: "user",
                    content: descriptionPromptContent
                }];
                const descriptionAndNickname = await callOpenAI(descriptionPrompt, 100);
                const lines = descriptionAndNickname.split('\n');
                let parsedNickname = lines.find(line => line.toLowerCase().startsWith('nickname:'));
                generatedNickname = parsedNickname ? parsedNickname.replace(/nickname:/i, '').trim() : lines.pop().trim();
                generatedNickname = generatedNickname || "Mystery Girl";
                generatedImageDescription = lines.filter(line => !line.toLowerCase().startsWith('nickname:') && line.trim() !== generatedNickname).join('\n').trim();
                generatedImageDescription = generatedImageDescription || "Image(s) received.";
            } else {
                const nicknamePrompt = [{
                    role: "user",
                    content: `Based on the following initial message, suggest a short, catchy, SFW nickname for the person being discussed:\n\n"${newMessageText}"\n\nNickname:`
                }];
                generatedNickname = (await callOpenAI(nicknamePrompt, 20)).trim() || "Chat Pal";
            }
        } else if (finalUserMessageContent.length > 0 && imageUrlsForOpenAI.length > 0) {
            generatedNickname = null;
            const descPromptContentSubsequent = [...finalUserMessageContent];
            descPromptContentSubsequent.unshift({ type: "text", text: "Describe the image(s) briefly for context in a chat analysis. Focus on the people, setting, and overall vibe." });
            const descriptionPromptSubsequent = [{
                role: "user",
                content: descPromptContentSubsequent
            }];
            try {
                generatedImageDescription = await callOpenAI(descriptionPromptSubsequent, 100);
                generatedImageDescription = generatedImageDescription.trim() || "Image(s) analyzed.";
            } catch (descError) {
                generatedImageDescription = "Error analyzing image(s).";
            }
        }
        if (savedMessage && generatedImageDescription) {
            const { error: updateError } = await supabaseAdmin
                .from('messages')
                .update({ image_description: generatedImageDescription })
                .eq('id', savedMessage.id);
            if (!updateError) {
                 savedMessage.image_description = generatedImageDescription;
            }
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
        const suggestionText = await callOpenAI(conversation, 300);
        const suggestions = suggestionText.split(/\n\d\.\s+|\n\*\s+|\n-\s+|\n\n/)
                                   .map(s => s.replace(/^\d\.\s*/, '').replace(/^[\*-]\s*/, '').trim())
                                   .filter(s => s.length > 5 && s.length < 500);
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