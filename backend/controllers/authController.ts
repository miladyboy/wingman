import { Request, Response } from "express";
import { generateOAuthUrl } from "../services/authService";

// Accept header helper – checks if client prefers JSON.
function wantsJson(req: Request): boolean {
  const accept = req.headers.accept || "";
  return accept.includes("application/json");
}

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
  try {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const redirectTo = `${frontendUrl}/auth`;
    const url = await generateOAuthUrl("google", redirectTo);

    if (wantsJson(req)) {
      res.json({ url });
      return;
    }
    res.redirect(302, url);
    return;
  } catch (err: any) {
    console.error("[googleOAuthUrl] Failed to generate OAuth URL:", err);
    res
      .status(500)
      .json({ error: err?.message || "Failed to generate OAuth URL" });
    return;
  }
}
