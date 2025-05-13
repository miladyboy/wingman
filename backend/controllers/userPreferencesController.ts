import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../services/supabaseService';
import { getUserIdFromAuthHeader } from '../utils/auth';

const MAX_PREFERENCES_LENGTH = 1000;

export async function getUserPreferences(req: Request, res: Response): Promise<void> {
  if (!supabaseAdmin) {
    res.status(500).json({ error: 'Supabase client not initialized' });
    return;
  }
  const userId = await getUserIdFromAuthHeader(req.headers.authorization, supabaseAdmin);
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('preferences')
    .eq('id', userId)
    .single();
  if (error) {
    res.status(500).json({ error: 'Failed to fetch preferences' });
    return;
  }
  res.json({ preferences: data?.preferences || '' });
}

export async function updateUserPreferences(req: Request, res: Response): Promise<void> {
  if (!supabaseAdmin) {
    res.status(500).json({ error: 'Supabase client not initialized' });
    return;
  }
  const userId = await getUserIdFromAuthHeader(req.headers.authorization, supabaseAdmin);
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const { preferences } = req.body;
  if (typeof preferences !== 'string' || preferences.length > MAX_PREFERENCES_LENGTH) {
    res.status(400).json({ error: 'Invalid preferences' });
    return;
  }
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ preferences })
    .eq('id', userId);
  if (error) {
    res.status(500).json({ error: 'Failed to update preferences' });
    return;
  }
  res.json({ success: true });
} 