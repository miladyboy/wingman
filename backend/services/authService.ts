import { SupabaseClient } from "@supabase/supabase-js";
import jwt, { JwtPayload } from "jsonwebtoken";
import { supabaseAdmin } from "./supabaseService";

export interface AuthPayload {
  userId: string;
  email: string;
  roles: string[];
}

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

if (!JWT_SECRET) {
  console.warn(
    "[authService] SUPABASE_JWT_SECRET env var is not set – verifyToken will fail at runtime."
  );
}

/**
 * Generates a provider-specific OAuth URL by delegating to the Supabase Admin client.
 * The resulting URL can be used on the frontend to redirect the user to the provider.
 *
 * @param provider Currently only "google" is supported.
 * @param redirectTo Absolute URL to redirect back to after OAuth flow finishes.
 * @returns A promise that resolves with the generated URL.
 * @throws Error if the Supabase client is not configured or URL generation fails.
 */
export async function generateOAuthUrl(
  provider: "google",
  redirectTo: string
): Promise<string> {
  if (!supabaseAdmin) {
    throw new Error("Supabase client not initialized");
  }
  const { data, error } = await supabaseAdmin.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  });
  if (error || !data?.url) {
    throw new Error(error?.message || "Failed to generate OAuth URL");
  }
  return data.url;
}

/**
 * Verifies the Supabase JWT using the project secret and returns a lightweight auth payload.
 *
 * @param token The bearer token sent by the frontend.
 * @returns A promise that resolves with the decoded AuthPayload or rejects if verification fails.
 */
export async function verifyToken(token: string): Promise<AuthPayload> {
  if (!JWT_SECRET) {
    throw new Error("SUPABASE_JWT_SECRET not configured");
  }

  let decoded: JwtPayload | string;
  try {
    decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (err) {
    throw new Error("Invalid or expired token");
  }

  if (typeof decoded !== "object" || !decoded.sub) {
    throw new Error("Malformed token payload");
  }

  // Supabase sets `sub` claim as the user id, and `email` + `role` claims are also present.
  const userId = decoded.sub as string;
  const email = (decoded.email || "") as string;
  const roleClaim = decoded.role || decoded.roles || "authenticated";
  const roles: string[] = Array.isArray(roleClaim)
    ? (roleClaim as string[])
    : [roleClaim as string];

  return { userId, email, roles };
}
