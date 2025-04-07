const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');

// Load environment variables
dotenv.config();

const app = express();
const port = 3001;

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

app.use(cors());

// POST endpoint to analyze image and/or text
app.post('/analyze', upload.single('image'), async (req, res) => {
  try {
    const userText = req.body.text || '';
    let imageContent = null;
    let hasImage = false;

    // Process image if uploaded
    if (req.file) {
      hasImage = true;
      console.log('File uploaded successfully:', req.file);
      const imagePath = req.file.path;
      const imageBuffer = fs.readFileSync(imagePath);
      console.log('Image read successfully, size:', imageBuffer.length, 'bytes');

      // Create image content for API payload
      imageContent = {
        type: "image_url",
        image_url: {
          url: `data:image/${req.file.mimetype};base64,${imageBuffer.toString('base64')}`
        }
      };

      // Clean up the uploaded file after processing
      fs.unlinkSync(imagePath);
      console.log('Temporary file cleaned up');
    } else if (!userText) {
      return res.status(400).json({ error: 'No input provided. Please provide text, image, or both.' });
    }

    // Create API payload based on input type
    const messages = [
      {
        role: "user",
        content: []
      }
    ];

    // Add appropriate system message based on input type
    if (hasImage && userText) {
      // Case: Both image and text
      messages[0].content.push({
        type: "text",
        text: `This is a screenshot of a conversation, along with the following context: "${userText}". Suggest 2-3 possible flirty or clever replies to continue the conversation in a natural and engaging way.`
      });
      messages[0].content.push(imageContent);
    } else if (hasImage) {
      // Case: Image only
      messages[0].content.push({
        type: "text",
        text: "This is a screenshot of a conversation. Suggest 2-3 possible flirty or clever replies to continue the conversation in a natural and engaging way."
      });
      messages[0].content.push(imageContent);
    } else {
      // Case: Text only
      messages[0].content.push({
        type: "text",
        text: `${userText}. Provide 2-3 flirty or clever responses that would be engaging in this conversation.`
      });
    }

    const payload = {
      model: "gpt-4o",
      messages: messages,
      max_tokens: 300
    };

    console.log('Sending request to OpenAI API...');
    console.log('API Key present:', !!process.env.OPENAI_API_KEY);
    // Log a masked version of the API key for debugging (showing only first 5 chars)
    if (process.env.OPENAI_API_KEY) {
      console.log('API Key prefix:', process.env.OPENAI_API_KEY.substring(0, 5) + '...');
    }

    // Call OpenAI API to analyze the image and/or text
    const response = await axios.post('https://api.openai.com/v1/chat/completions', payload, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Response received from OpenAI API');
    console.log('Response status:', response.status);
    console.log('Response data structure:', Object.keys(response.data));

    // Extract suggestions from the response
    let suggestions = [];
    if (response.data && response.data.choices && response.data.choices[0]) {
      const content = response.data.choices[0].message.content;
      console.log('Raw content from API:', content);
      
      // Split by numbered list (1. 2. 3.) or newlines to extract individual suggestions
      suggestions = content.split(/\d\.\s+|\n+/)
                         .filter(suggestion => suggestion.trim().length > 0)
                         .map(suggestion => suggestion.trim());
    }

    console.log('Extracted suggestions:', suggestions);

    // Send suggestions back to the client
    res.json({ suggestions });
  } catch (error) {
    console.error('Error analyzing content:');
    if (error.response) {
      console.error('API response error:', error.response.status);
      console.error('Error data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      error: 'Failed to analyze content', 
      details: error.response ? error.response.data : error.message 
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
