import { Request, Response } from 'express';
import { supabaseAdmin } from '../services/supabaseService';

export async function googleOAuthUrl(req: Request, res: Response): Promise<void> {
  if (!supabaseAdmin) {
    res.status(500).json({ error: 'Supabase client not initialized' });
    return;
  }
  const redirectTo = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth`;
  try {
    const { data, error } = await supabaseAdmin.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (error || !data?.url) {
      res.status(500).json({ error: error?.message || 'Failed to generate OAuth URL' });
      return;
    }
    res.json({ url: data.url });
  } catch {
    res.status(500).json({ error: 'Failed to generate OAuth URL' });
  }
}
