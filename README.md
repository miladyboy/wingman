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

> **Supabase Project Naming**: For best results, name your Supabase project exactly the same as your GitHub repository and local folder (e.g., `harem`). This ensures the LLM and all tooling can reliably identify and use the correct Supabase project, avoiding accidental connections to the wrong database.

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

### Stripe Webhook Forwarding (Development Only)

The app now requires the [Stripe CLI](https://stripe.com/docs/stripe-cli) for local development to forward webhook events to your frontend. The `start:all` script will automatically run `stripe listen --forward-to localhost:3001/api/stripe/webhook` in parallel with the frontend and backend servers.

If you don't have the Stripe CLI installed, follow [these instructions](https://stripe.com/docs/stripe-cli#install) to install it.

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