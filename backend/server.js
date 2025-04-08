const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');
// const multer = require('multer'); // Removed multer
// const fs = require('fs'); // Removed fs
const cors = require('cors');

// Load environment variables
dotenv.config();

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
app.post('/analyze', async (req, res) => { // Removed multer middleware
    try {
        const { history, newMessage } = req.body; // Get history and newMessage from body

        console.log("Received newMessage:", JSON.stringify(newMessage)); // Log for debugging

        if (!newMessage || ((!newMessage.text || newMessage.text.trim() === '') && !newMessage.imageBase64)) { // Check newMessage structure
            return res.status(400).json({ error: 'New message content (text or image) is required.' });
        }

        let generatedNickname = null;
        let generatedImageDescription = null;
        let userMessageContent = []; // Changed structure for multi-part content

        // Determine if it's the first user message in the thread
        const isInitialUserMessage = !history || history.filter(msg => msg.role === 'user').length === 0;

        // --- Handle Initial Message: Nickname & Image Description ---
        if (isInitialUserMessage) {
            if (newMessage.imageBase64) {
                // 1. Generate Image Description & Nickname
                console.log("Generating image description and nickname...");
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
                const lines = descriptionAndNickname.split('\\n');
                generatedImageDescription = lines.slice(0, -1).join(' ').trim() || "Image received."; // Fallback description
                generatedNickname = lines.pop().replace(/Nickname:?\\s*/i, '').trim() || "Mystery Girl"; // Fallback nickname
                console.log("Generated Description:", generatedImageDescription);
                console.log("Generated Nickname:", generatedNickname);

                // Prepare user message content for history, including the *description* not the image itself for history saving
                 userMessageContent.push({ type: "text", text: newMessage.text ? `${newMessage.text} [Image Analysis: ${generatedImageDescription}]` : `[Image Analysis: ${generatedImageDescription}]` });
                 // We still need to send the image for the *current* analysis call
                 userMessageContent.push({
                     type: "image_url",
                     image_url: { url: `data:${newMessage.imageMimeType};base64,${newMessage.imageBase64}` }
                 });


            } else {
                // 2. Generate Nickname from text only
                console.log("Generating nickname from text...");
                const nicknamePrompt = [{
                    role: "user",
                    content: `Based on the following initial message, suggest a short, catchy, SFW nickname for the person being discussed:\\n\\n"${newMessage.text}"\\n\\nNickname:`
                }];
                generatedNickname = (await callOpenAI(nicknamePrompt, 20)).trim() || "Chat Pal"; // Fallback nickname
                console.log("Generated Nickname:", generatedNickname);
                userMessageContent.push({ type: "text", text: newMessage.text });
            }
        } else {
             // Not the initial message
             if (newMessage.text) {
                userMessageContent.push({ type: "text", text: newMessage.text });
             }
             if (newMessage.imageBase64) {
                // For subsequent messages, pass the image directly for analysis
                // The frontend will be responsible for storing a description if needed later
                console.log("Including subsequent image in payload...");
                 userMessageContent.push({
                     type: "image_url",
                     image_url: { url: `data:${newMessage.imageMimeType};base64,${newMessage.imageBase64}` }
                 });
                 // Add a placeholder text if no text was provided with the subsequent image
                 if (!newMessage.text) {
                    // Insert placeholder text at the beginning if it doesn't exist
                    if (!userMessageContent.some(item => item.type === 'text')) {
                        userMessageContent.unshift({ type: "text", text: "[Image provided]" });
                    } else {
                         userMessageContent.find(item => item.type === 'text').text += " [Image provided]";
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
        console.log("Generating flirty suggestions...");
        const suggestionText = await callOpenAI(conversation, 300); // Default tokens for suggestions

        // Improved suggestion parsing
         const suggestions = suggestionText.split(/\n\d\.\s+|\n\*\s+|\n-\s+|\n\n/)
                                     .map(s => s.replace(/^\d\.\s*/, '').replace(/^[\*-]\s*/, '').trim()) // Remove numbering/bullets
                                     .filter(s => s.length > 5 && s.length < 500); // Basic length filtering


        console.log('Extracted suggestions:', suggestions);

        // Send suggestions (and potentially nickname/description) back to the client
        res.json({
            suggestions,
            nickname: generatedNickname, // Will be null if not the first message
            imageDescription: generatedImageDescription // Will be null if no image or not first message
         });

    } catch (error) {
        console.error('Error in /analyze endpoint:', error); // Log the detailed error
        res.status(500).json({
            error: 'Failed to analyze content',
            details: error.message // Send back a user-friendly error message
        });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
