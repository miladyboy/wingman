import { Request, Response } from "express";
import { supabaseAdmin } from "../services/supabaseService";

/**
 * Generates a Google OAuth URL for user authentication.
 * Creates a Supabase OAuth sign-in URL that redirects to the frontend auth page after authentication.
 *
 * @param req - Express request object
 * @param res - Express response object containing the OAuth URL or error message
 * @returns Promise that resolves when the response is sent
 * @throws Will return 500 status if Supabase client is not initialized or OAuth URL generation fails
 */
export async function googleOAuthUrl(
  req: Request,
  res: Response
): Promise<void> {
  if (!supabaseAdmin) {
    res.status(500).json({ error: "Supabase client not initialized" });
    return;
  }
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const redirectTo = `${frontendUrl}/auth`;
  try {
    const { data, error } = await supabaseAdmin.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error || !data?.url) {
      console.error("[googleOAuthUrl] Error or missing URL:", error, data);
      res
        .status(500)
        .json({ error: error?.message || "Failed to generate OAuth URL" });
      return;
    }
    res.json({ url: data.url });
  } catch (err) {
    console.error("[googleOAuthUrl] Exception:", err);
    res.status(500).json({ error: "Failed to generate OAuth URL" });
  }
}
