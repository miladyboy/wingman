const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function callOpenAI(messages, max_tokens = 500, model = "gpt-4o") {
    try {
        const response = await openai.chat.completions.create({
            model,
            messages,
            max_tokens
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        throw new Error(`OpenAI API Error: ${error.message}`);
    }
}

module.exports = { callOpenAI }; 