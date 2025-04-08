const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');
// const multer = require('multer'); // Removed multer
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

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Add JSON middleware and increase limit for base64 images

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
app.post('/analyze', async (req, res) => {
    try {
        // --- Extract Auth Token ---
        const authHeader = req.headers.authorization;
        let userAccessToken = null;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            userAccessToken = authHeader.split(' ')[1];
            console.log("Received user access token."); // Log token presence
            // You could potentially verify the token here using supabaseAdmin.auth.getUser(userAccessToken)
            // But only if you need user identity *on the backend* for this specific request.
            // For now, we just acknowledge it's received.
        } else {
            console.warn("No authorization token provided by frontend.");
            // Depending on security requirements, you might reject the request here:
            // return res.status(401).json({ error: 'Authorization token required.' });
        }
        // --- End Extract Auth Token ---

        const { history, newMessage } = req.body;

        console.log("[Backend] Received /analyze request:", {
            historyLength: history?.length ?? 0,
            newMessageText: newMessage?.text,
            hasImage: !!newMessage?.imageBase64
        });

        if (!newMessage || ((!newMessage.text || newMessage.text.trim() === '') && !newMessage.imageBase64)) { // Check newMessage structure
            console.warn("[Backend] Bad request: Missing text or image.");
            return res.status(400).json({ error: 'New message content (text or image) is required.' });
        }

        let generatedNickname = null;
        let generatedImageDescription = null;
        let userMessageContent = []; // Changed structure for multi-part content

        // Determine if it's the first user message in the thread
        const isInitialUserMessage = !history || history.filter(msg => msg.role === 'user').length === 0;
        console.log("[Backend] Is initial user message:", isInitialUserMessage);

        // --- Handle Initial Message: Nickname & Image Description ---
        if (isInitialUserMessage) {
            if (newMessage.imageBase64) {
                // 1. Generate Image Description & Nickname
                console.log("[Backend] Initial message with image. Generating description and nickname...");
                const descriptionPrompt = [{
                    role: "user",
                    content: [
                        { type: "text", text: "Describe this image briefly for context in a chat analysis. Focus on the people, setting, and overall vibe. Then, suggest a short, catchy, SFW nickname for the girl based *only* on this image." },
                        {
                            type: "image_url",
                            image_url: { url: `data:${newMessage.imageMimeType};base64,${newMessage.imageBase64}` }
                        }
                    ]
                }];
                const descriptionAndNickname = await callOpenAI(descriptionPrompt, 100); // Lower max_tokens
                // Basic parsing: Assume description is first, nickname is last line or similar. Needs refinement.
                const lines = descriptionAndNickname.split('\n');

                // Attempt to parse description and nickname more robustly
                let parsedNickname = lines.find(line => line.toLowerCase().startsWith('nickname:'));
                generatedNickname = parsedNickname ? parsedNickname.replace(/nickname:/i, '').trim() : lines.pop().trim();
                generatedNickname = generatedNickname || "Mystery Girl"; // Fallback nickname

                // Assume description is the rest
                generatedImageDescription = lines.filter(line => !line.toLowerCase().startsWith('nickname:') && line.trim() !== generatedNickname).join('\n').trim();
                generatedImageDescription = generatedImageDescription || "Image received."; // Fallback description

                console.log("[Backend] Generated Description:", generatedImageDescription);
                console.log("[Backend] Generated Nickname:", generatedNickname);

                // Prepare user message content for history, including the *description* not the image itself for history saving
                if (newMessage.text) {
                    userMessageContent.push({ type: "text", text: newMessage.text });
                }
                // We still need to send the image for the *current* analysis call
                userMessageContent.push({
                    type: "image_url",
                    image_url: { url: `data:${newMessage.imageMimeType};base64,${newMessage.imageBase64}` }
                });

            } else {
                // 2. Generate Nickname from text only
                console.log("[Backend] Initial message text-only. Generating nickname...");
                const nicknamePrompt = [{
                    role: "user",
                    content: `Based on the following initial message, suggest a short, catchy, SFW nickname for the person being discussed:\n\n"${newMessage.text}"\n\nNickname:`
                }];
                generatedNickname = (await callOpenAI(nicknamePrompt, 20)).trim() || "Chat Pal"; // Fallback nickname
                console.log("[Backend] Generated Nickname:", generatedNickname);
                userMessageContent.push({ type: "text", text: newMessage.text });
            }
        } else { // Not the initial message
            console.log("[Backend] Subsequent message.");
            generatedImageDescription = null; // Initialize for this scope
            generatedNickname = null; // Nickname only generated for initial message

            // Generate description if a subsequent image is provided
            if (newMessage.imageBase64) {
                console.log("[Backend] Subsequent message with image. Generating description...");
                const descriptionPromptSubsequent = [{
                    role: "user",
                    content: [
                        { type: "text", text: "Describe this image briefly for context in a chat analysis. Focus on the people, setting, and overall vibe." },
                        {
                            type: "image_url",
                            image_url: { url: `data:${newMessage.imageMimeType};base64,${newMessage.imageBase64}` }
                        }
                    ]
                }];
                try {
                    generatedImageDescription = await callOpenAI(descriptionPromptSubsequent, 100);
                    generatedImageDescription = generatedImageDescription.trim() || "Image analyzed."; // Add fallback
                    console.log("[Backend] Generated Subsequent Description:", generatedImageDescription);
                } catch (descError) {
                    console.error("[Backend] Error generating subsequent image description:", descError);
                    generatedImageDescription = "Error analyzing image."; // Set error description
                }
            }

            // Prepare user message content for the *suggestion* generation call
            // This part remains largely the same, ensuring the image URL is passed for context
            userMessageContent = []; // Reset for this scope
            if (newMessage.text) {
                userMessageContent.push({ type: "text", text: newMessage.text });
            }
            if (newMessage.imageBase64) {
                console.log("[Backend] Including subsequent image URL in suggestion context payload...");
                userMessageContent.push({
                    type: "image_url",
                    image_url: { url: `data:${newMessage.imageMimeType};base64,${newMessage.imageBase64}` }
                });
                // Add placeholder text if needed (as before)
                if (!newMessage.text) {
                    if (!userMessageContent.some(item => item.type === 'text')) {
                        userMessageContent.unshift({ type: "text", text: "[Image provided]" });
                    } else {
                         const textItem = userMessageContent.find(item => item.type === 'text');
                         if (textItem) textItem.text += " [Image provided]";
                    }
                }
            }
        }

        // Ensure userMessageContent is not empty if only an image was sent in subsequent message
        if (userMessageContent.length === 0 && newMessage.imageBase64 && !isInitialUserMessage) {
            userMessageContent.push({ type: "text", text: "[Image provided]" });
            userMessageContent.push({
                type: "image_url",
                image_url: { url: `data:${newMessage.imageMimeType};base64,${newMessage.imageBase64}` }
            });
        }

        console.log("[Backend] Final user message content for suggestion generation:", JSON.stringify(userMessageContent));

        // --- Construct Full Conversation History for Suggestions ---
        const conversation = [
            {
                role: "system",
                content: "You are a flirty wingman AI. Your goal is to help the user craft witty, engaging, and flirty replies in their conversations. Analyze the provided chat history and the latest message. Suggest 2-3 distinct replies. Keep the tone appropriate to the conversation's vibe. Be aware of context and adapt."
            },
            // Add existing history (ensure it's in the correct format)
            ...(history || []).map(msg => ({ role: msg.role, content: msg.content })), // Map to OpenAI format if needed
            // Add the new user message (potentially with image for analysis)
            {
                role: "user",
                content: userMessageContent
            }
        ];

        // --- Generate Flirty Suggestions ---
        console.log("[Backend] Generating flirty suggestions...");
        const suggestionText = await callOpenAI(conversation, 300); // Default tokens for suggestions

        // Improved suggestion parsing
        const suggestions = suggestionText.split(/\n\d\.\s+|\n\*\s+|\n-\s+|\n\n/)
                                    .map(s => s.replace(/^\d\.\s*/, '').replace(/^[\*-]\s*/, '').trim()) // Remove numbering/bullets
                                    .filter(s => s.length > 5 && s.length < 500); // Basic length filtering

        console.log('[Backend] Extracted suggestions:', suggestions);

        const responsePayload = {
            suggestions,
            nickname: generatedNickname,
            imageDescription: generatedImageDescription
        };
        console.log("[Backend] Sending response to frontend:", responsePayload);

        // Send suggestions (and potentially nickname/description) back to the client
        res.json(responsePayload);

    } catch (error) {
        console.error('[Backend] Error during /analyze:', error);
        // Ensure detailed error is sent back for easier debugging
        res.status(500).json({ error: 'Failed to analyze message', details: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
