# Mobile App (Expo)

This directory contains the React Native version of the app built with Expo. It reuses the existing backend and Supabase setup used by the web frontend.

## Development

1. Install dependencies:

```bash
npm install
```

2. Set the environment variables in a `.env` file or via your preferred method:

```
EXPO_PUBLIC_SUPABASE_URL=<your-supabase-url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
EXPO_PUBLIC_BACKEND_URL=<your-backend-url>
```

3. Start the Expo development server:

```bash
npm start
```

This will launch the Expo dev tools, allowing you to run the app on iOS, Android, or web.
