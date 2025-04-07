# FlirtOS

A personal AI wingman that analyzes chat screenshots and suggests flirty or clever replies. Built with React, Express, and OpenAI's Vision capabilities.

## Features

- Upload screenshots of conversations
- AI-powered analysis of chat context using OpenAI's Vision capabilities
- Receive 2-3 suggested flirty or clever replies
- Clean, modern desktop interface built with React and Tailwind CSS

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS
- **Backend**: Node.js, Express
- **AI**: OpenAI GPT-4o with vision capabilities

## Installation

### Prerequisites

- Node.js (v14+)
- npm or yarn
- OpenAI API key

### Setup

1. Clone the repository:

```bash
git clone https://github.com/miladyboy/flirt-os.git
cd flirt-os
```

2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Create a `.env` file in the backend directory:

```
OPENAI_API_KEY=your_openai_api_key_here
```

4. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

## Running the Application

1. Start the backend server:

```bash
cd backend
npm run dev
```

2. Start the frontend development server:

```bash
cd frontend
npm run dev
```

3. Open your browser and navigate to http://localhost:3000 (or the URL shown in your terminal)

## Usage

1. Upload a screenshot of a conversation.
2. Wait a few seconds for the AI to analyze the screenshot.
3. View the suggested replies.
4. Use one of the suggested replies in your conversation.

## License

MIT

## Disclaimer

This project is intended for entertainment purposes only. Always use your own judgment when interacting with others online. 