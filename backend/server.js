const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');
const multer = require('multer'); // ADDED: For file uploads
const path = require('path'); // ADDED: For file path operations
const { v4: uuidv4 } = require('uuid'); // ADDED: For generating unique IDs
// const fs = require('fs'); // Removed fs
const cors = require('cors');
// --- Supabase Backend Setup ---
const { createClient } = require('@supabase/supabase-js');
// --- End Supabase Backend Setup ---

// Load environment variables
dotenv.config();

// --- Supabase Backend Setup ---
// Initialize Supabase Admin Client (use environment variables)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase URL or Service Role Key not found in .env. Backend Supabase operations may fail.');
  // Depending on requirements, you might want to throw an error here if Supabase is critical
  // throw new Error('Supabase URL and Service Role Key must be provided in backend environment variables');
}

// Initialize client ONLY if variables are present
const supabaseAdmin = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        // Important: Prevent Supabase client from persisting sessions server-side
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
    }
}) : null;

console.log(`Supabase Admin Client ${supabaseAdmin ? 'Initialized' : 'NOT Initialized (Missing ENV vars)'}`);
// --- End Supabase Backend Setup ---

const app = express();
const port = 3001;

// Set up multer for file uploads // Removed multer setup
// const upload = multer({ dest: 'uploads/' }); // Removed multer setup
// ADDED: Configure multer for memory storage to handle multiple files under 'images' field
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // Example: Limit file size to 10MB
});

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Add JSON middleware and increase limit for base64 images
// ADDED: Middleware for URL-encoded data (needed alongside multipart)
app.use(express.urlencoded({ extended: true }));

// Helper function to call OpenAI API
async function callOpenAI(messages, max_tokens = 300, model = "gpt-4o") {
    const payload = {
        model: model,
        messages: messages,
        max_tokens: max_tokens
    };

    console.log(`Sending request to OpenAI API (${model})...`);
    console.log('API Key present:', !!process.env.OPENAI_API_KEY);
    if (process.env.OPENAI_API_KEY) {
        console.log('API Key prefix:', process.env.OPENAI_API_KEY.substring(0, 5) + '...');
    }

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', payload, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Response received from OpenAI API');
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Error calling OpenAI API:');
        if (error.response) {
            console.error('API response error:', error.response.status);
            console.error('Error data:', error.response.data);
            throw new Error(`OpenAI API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
            console.error('No response received:', error.request);
            throw new Error('OpenAI API Error: No response received');
        } else {
            console.error('Error message:', error.message);
            throw new Error(`OpenAI API Error: ${error.message}`);
        }
    }
}

// POST endpoint to analyze conversation history and new message
// MODIFIED: Use multer middleware for 'images' array (up to, say, 5 files)
app.post('/analyze', upload.array('images', 5), async (req, res) => {
    try {
        // --- Extract Auth Token ---
        const authHeader = req.headers.authorization;
        let userAccessToken = null;
        let userId = null; // ADDED: To store user ID if needed for RLS or paths

        if (authHeader && authHeader.startsWith('Bearer ')) {
            userAccessToken = authHeader.split(' ')[1];
            console.log("Received user access token.");
            try {
                // ADDED: Get user from token to use user ID later
                if (supabaseAdmin) {
                    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(userAccessToken);
                    if (userError) {
                        console.warn("Error getting user from token:", userError.message);
                        // Decide if this is fatal - maybe allow anonymous uploads? For now, proceed but log.
                    } else if (user) {
                        userId = user.id;
                        console.log("Authenticated user ID:", userId);
                    } else {
                        console.warn("Token valid but no user found.");
                    }
                }
            } catch (e) {
                console.error("Error verifying token/getting user:", e);
            }
        } else {
            console.warn("No authorization token provided by frontend.");
            // return res.status(401).json({ error: 'Authorization token required.' }); // Consider enforcing auth
        }
        // --- End Extract Auth Token & Get User ---

        // --- Extract Text and Files ---
        // Text data comes from req.body (due to multipart)
        // Files come from req.files (thanks to multer)
        const { historyJson, newMessageText, conversationId } = req.body; // Expecting text fields from FormData
        const history = historyJson ? JSON.parse(historyJson) : []; // Parse history if sent as JSON string
        const files = req.files || []; // Array of files from multer

        console.log("[Backend] Received /analyze request:", {
            historyLength: history?.length ?? 0,
            newMessageText: newMessageText,
            fileCount: files.length,
            conversationId: conversationId // ADDED: Log conversation ID if provided
        });


        // --- Basic Validation ---
        if ((!newMessageText || newMessageText.trim() === '') && files.length === 0) {
            console.warn("[Backend] Bad request: Missing text or image files.");
            return res.status(400).json({ error: 'New message content (text or image files) is required.' });
        }
        if (!supabaseAdmin) {
            console.error("[Backend] Supabase Admin client not initialized. Cannot process request.");
            return res.status(500).json({ error: 'Backend Supabase client not configured.' });
        }
        // conversationId might be needed to link message/images if it's an existing chat
        // If it's a new chat, we might need to create a conversation record first (logic TBD based on frontend)


        // --- Placeholder for Message & Image Records ---
        let savedMessage = null; // Will hold the saved message record from DB
        let imageRecords = []; // Will hold { storage_path, filename, content_type, filesize } for DB
        let imageUrlsForOpenAI = []; // Will hold public URLs for OpenAI vision
        let imageUrlsForFrontend = []; // Will hold public URLs for frontend display

        // --- TODO: Determine if New Conversation or Existing ---
        // This logic depends on how the frontend sends conversationId
        // For now, assume we need to save the message first to get its ID
        // Ideally, wrap message save + image saves in a transaction if possible

        // --- Save the Message Stub (without AI response yet) ---
        // We need the message ID to associate images
        // We will update this message later with AI content if needed
        try {
            // Replace 'sender' with 'role' if needed to match frontend/history format? Assuming 'sender' used in DB
            const messageData = {
                conversation_id: conversationId, // This needs to be valid or handled if null/new
                sender: 'user', // Assuming 'user' for the incoming message
                content: newMessageText || null, // Save text content
                // image_description will be added later after OpenAI analysis
            };
            // We might need user_id here if RLS requires it for insert
            if (userId) {
              // Assuming a user_id column exists on messages table for RLS
              // messageData.user_id = userId;
            }

            // Adjust table name if different
            const { data: newMessageRecord, error: messageError } = await supabaseAdmin
                .from('messages')
                .insert(messageData)
                .select() // Return the created record
                .single(); // Expect only one record

            if (messageError) {
                console.error("[Backend] Error saving message stub:", messageError);
                // Check for specific errors, e.g., invalid conversation_id foreign key
                if (messageError.code === '23503') { // foreign_key_violation
                     return res.status(400).json({ error: `Invalid conversation ID: ${conversationId}. Cannot save message.` });
                }
                throw new Error(`Failed to save message stub: ${messageError.message}`);
            }
            savedMessage = newMessageRecord;
            console.log("[Backend] Saved message stub with ID:", savedMessage.id);

        } catch (dbError) {
             console.error("[Backend] Database operation failed:", dbError);
             return res.status(500).json({ error: 'Database operation failed.', details: dbError.message });
        }


        // --- Upload Files to Supabase Storage & Prepare Records ---
        if (files.length > 0 && savedMessage) {
            console.log(`[Backend] Uploading ${files.length} files for message ID: ${savedMessage.id}...`);
            for (const file of files) {
                const fileExt = path.extname(file.originalname);
                const fileNameWithoutExt = path.basename(file.originalname, fileExt);
                // Ensure filename is filesystem-safe (basic example)
                const safeFileNameBase = fileNameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '_');
                // Create a unique path using message ID and UUID
                const uniqueFileName = `${safeFileNameBase}-${uuidv4()}${fileExt}`;
                // Include user ID in path if available for better organization/RLS potential
                const storageDirPath = userId ? `public/${userId}/${savedMessage.id}` : `public/${savedMessage.id}`;
                const storagePath = `${storageDirPath}/${uniqueFileName}`;

                console.log(`[Backend] Uploading ${file.originalname} to ${storagePath}`);

                const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
                    .from('chat-images') // Use the correct bucket name 'chat-images'
                    .upload(storagePath, file.buffer, {
                        contentType: file.mimetype,
                        cacheControl: '3600', // Optional: Cache for 1 hour
                        // upsert: false // Default is false, fails if file exists
                    });

                if (uploadError) {
                    console.error(`[Backend] Error uploading file ${file.originalname}:`, uploadError);
                    // Decide how to handle partial failures - skip file, return error?
                    // For now, log and continue, but don't add to records
                    continue; // Skip this file
                }

                console.log(`[Backend] File ${file.originalname} uploaded successfully. Path: ${uploadData.path}`);

                // Get Public URL for OpenAI and Frontend
                const { data: urlData } = supabaseAdmin.storage
                    .from('chat-images')
                    .getPublicUrl(uploadData.path); // Use the path returned by upload

                if (urlData?.publicUrl) {
                     imageUrlsForOpenAI.push(urlData.publicUrl);
                     imageUrlsForFrontend.push(urlData.publicUrl);
                     console.log(`[Backend] Public URL: ${urlData.publicUrl}`);
                } else {
                    console.warn(`[Backend] Could not get public URL for ${uploadData.path}`);
                    // Handle cases where URL is needed but unavailable?
                }

                // Prepare record for ChatMessageImages table
                imageRecords.push({
                    message_id: savedMessage.id,
                    storage_path: uploadData.path, // Store the returned path from Supabase
                    filename: file.originalname,
                    content_type: file.mimetype,
                    filesize: file.size
                });
            }

            // --- Save Image Records to Database ---
            if (imageRecords.length > 0) {
                console.log(`[Backend] Saving ${imageRecords.length} image records to ChatMessageImages...`);
                // Adjust table name if different ("ChatMessageImages" based on migration)
                const { error: imageDbError } = await supabaseAdmin
                    .from('ChatMessageImages')
                    .insert(imageRecords);

                if (imageDbError) {
                    console.error("[Backend] Error saving image records:", imageDbError);
                    // This is problematic - message saved, but images not linked.
                    // Need robust error handling/rollback if possible.
                    // For now, return an error, client might need to retry message.
                    // Consider deleting the message stub if image links fail?
                    return res.status(500).json({ error: 'Failed to save image references.', details: imageDbError.message });
                }
                console.log("[Backend] Image records saved successfully.");
            }
        }


        // --- Prepare for OpenAI Analysis ---
        let generatedNickname = null;
        let generatedImageDescription = null;
        let finalUserMessageContent = []; // Build content for OpenAI call

        // Determine if it's the first user message in the thread
        const isInitialUserMessage = !history || history.filter(msg => msg.role === 'user').length === 0;
        console.log("[Backend] Is initial user message:", isInitialUserMessage);

        // Add text part first
        if (newMessageText && newMessageText.trim() !== '') {
            finalUserMessageContent.push({ type: "text", text: newMessageText });
        }

        // Add image URLs for OpenAI vision model
        if (imageUrlsForOpenAI.length > 0) {
             // If only images were sent, add placeholder text for models that require it
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

        // --- Handle Initial Message: Nickname & Image Description ---
        // (This part uses OpenAI, so it needs the image URLs)
        if (isInitialUserMessage && finalUserMessageContent.length > 0) {
             // Only generate nickname/description if there's content (text or images)
            if (imageUrlsForOpenAI.length > 0) {
                // 1. Generate Image Description & Nickname from Image(s) (+ optional text)
                console.log("[Backend] Initial message with image(s). Generating description and nickname...");
                const descriptionPromptContent = [...finalUserMessageContent]; // Use content with URLs
                descriptionPromptContent.unshift({ type: "text", text: "Describe the image(s) briefly for context in a chat analysis. Focus on the people, setting, and overall vibe. Then, suggest a short, catchy, SFW nickname for the girl based *only* on the image(s)." });

                const descriptionPrompt = [{
                    role: "user",
                    content: descriptionPromptContent
                }];
                // ... (rest of nickname/description generation logic using descriptionPrompt) ...
                // Need to re-integrate the parsing logic here from the original code
                 const descriptionAndNickname = await callOpenAI(descriptionPrompt, 100);
                // Basic parsing - needs refinement
                const lines = descriptionAndNickname.split('\n');
                let parsedNickname = lines.find(line => line.toLowerCase().startsWith('nickname:'));
                generatedNickname = parsedNickname ? parsedNickname.replace(/nickname:/i, '').trim() : lines.pop().trim();
                generatedNickname = generatedNickname || "Mystery Girl";
                generatedImageDescription = lines.filter(line => !line.toLowerCase().startsWith('nickname:') && line.trim() !== generatedNickname).join('\n').trim();
                generatedImageDescription = generatedImageDescription || "Image(s) received.";

                console.log("[Backend] Generated Description:", generatedImageDescription);
                console.log("[Backend] Generated Nickname:", generatedNickname);

            } else {
                // 2. Generate Nickname from text only
                console.log("[Backend] Initial message text-only. Generating nickname...");
                const nicknamePrompt = [{
                    role: "user",
                    content: `Based on the following initial message, suggest a short, catchy, SFW nickname for the person being discussed:\n\n"${newMessageText}"\n\nNickname:`
                }];
                generatedNickname = (await callOpenAI(nicknamePrompt, 20)).trim() || "Chat Pal";
                console.log("[Backend] Generated Nickname:", generatedNickname);
            }
        } else if (finalUserMessageContent.length > 0 && imageUrlsForOpenAI.length > 0) { // Subsequent message with image(s)
            console.log("[Backend] Subsequent message with image(s). Generating description...");
            generatedNickname = null; // Only needed for initial

            const descPromptContentSubsequent = [...finalUserMessageContent]; // Use content with URLs
            descPromptContentSubsequent.unshift({ type: "text", text: "Describe the image(s) briefly for context in a chat analysis. Focus on the people, setting, and overall vibe." });

            const descriptionPromptSubsequent = [{
                role: "user",
                content: descPromptContentSubsequent
            }];
            try {
                generatedImageDescription = await callOpenAI(descriptionPromptSubsequent, 100);
                generatedImageDescription = generatedImageDescription.trim() || "Image(s) analyzed.";
                console.log("[Backend] Generated Subsequent Description:", generatedImageDescription);
            } catch (descError) {
                console.error("[Backend] Error generating subsequent image description:", descError);
                generatedImageDescription = "Error analyzing image(s).";
            }
        }


        // --- Update Message with Image Description (if generated) ---
        if (savedMessage && generatedImageDescription) {
            console.log(`[Backend] Updating message ${savedMessage.id} with image description...`);
             // Adjust table name if needed
            const { error: updateError } = await supabaseAdmin
                .from('messages')
                .update({ image_description: generatedImageDescription })
                .eq('id', savedMessage.id);

            if (updateError) {
                console.error(`[Backend] Error updating message ${savedMessage.id} with description:`, updateError);
                // Non-fatal? Log and continue.
            } else {
                 console.log(`[Backend] Message ${savedMessage.id} updated.`);
                 // Update local object too for response consistency
                 savedMessage.image_description = generatedImageDescription;
            }
        }


        // --- Construct Full Conversation History for Suggestions ---
        const conversation = [
            {
                role: "system",
                content: "You are a flirty wingman AI. Your goal is to help the user craft witty, engaging, and flirty replies in their conversations. Analyze the provided chat history and the latest message (including any image descriptions or context from images provided via URL). Suggest 2-3 distinct replies. Keep the tone appropriate to the conversation's vibe. Be aware of context and adapt."
            },
            // Add existing history
            ...(history || []).map(msg => ({
                role: msg.role,
                // Include image description in history if it exists
                content: msg.imageDescription ? `${msg.content}
[Image Description: ${msg.imageDescription}]` : msg.content
             })),
            // Add the new user message (using finalUserMessageContent which includes text and image URLs for OpenAI)
            {
                role: "user",
                content: finalUserMessageContent
            }
        ];


        // --- Generate Flirty Suggestions ---
        console.log("[Backend] Generating flirty suggestions...");
        const suggestionText = await callOpenAI(conversation, 300);

        // ... (suggestion parsing logic remains the same) ...
         const suggestions = suggestionText.split(/\n\d\.\s+|\n\*\s+|\n-\s+|\n\n/)
                                    .map(s => s.replace(/^\d\.\s*/, '').replace(/^[\*-]\s*/, '').trim())
                                    .filter(s => s.length > 5 && s.length < 500);

        console.log('[Backend] Extracted suggestions:', suggestions);


        // --- Prepare Final Response ---
        const responsePayload = {
            suggestions,
            nickname: generatedNickname, // Include if generated
            // Send back the saved message object (contains ID, content, generated description)
            savedMessage: savedMessage,
             // Send back the public URLs for the frontend to display
            imageUrls: imageUrlsForFrontend
        };
        console.log("[Backend] Sending response to frontend:", responsePayload);

        res.json(responsePayload);

    } catch (error) {
        console.error('[Backend] Error during /analyze:', error);
        res.status(500).json({ error: 'Failed to analyze message', details: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
