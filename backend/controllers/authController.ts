import { Request, Response } from "express";
import { generateOAuthUrl } from "../services/authService";

/**
 * Generates a Google OAuth URL for user authentication.
 * Creates a Supabase OAuth sign-in URL that redirects to the frontend auth page after authentication.
 *
 * @param req - Express request object
 * @param res - Express response object containing the OAuth URL or error message
 * @returns Promise that resolves when the response is sent
 * @throws Will return 500 status if Supabase client is not initialized, OAuth URL generation fails, or FRONTEND_URL is not defined.
 */
export async function googleOAuthUrl(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
      throw new Error("FRONTEND_URL is not defined in environment variables.");
    }
    const redirectTo = `${frontendUrl}/auth`;
    const url = await generateOAuthUrl("google", redirectTo);

    res.json({ url });
  } catch (err: any) {
    console.error("[googleOAuthUrl] Failed to generate OAuth URL:", err);
    res
      .status(500)
      .json({ error: err?.message || "Failed to generate OAuth URL" });
  }
}
