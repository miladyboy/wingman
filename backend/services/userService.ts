import { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "./supabaseService";
import type { SimpPreference } from "../types/user";

/**
 * Lightweight representation of a row in the `profiles` table.
 * Only the fields commonly accessed throughout the code-base are included;
 * any additional columns will be exposed via an open dictionary signature so
 * that callers can still reference them without having to update this type.
 */
export interface UserProfile {
  id: string;
  email?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  // Allow additional dynamic columns coming from the DB without breaking the compiler
  [key: string]: unknown;
}

/**
 * Normalised shape for user preferences consumed by the business logic layer.
 */
export interface UserPrefs {
  /**
   * Raw free-text preference string entered by the user. Empty string when not present.
   */
  text: string;
  /**
   * Two-letter ISO country or the sentinel value "auto" when the preference was not specified.
   */
  preferredCountry: string;
  /**
   * Explicit simp filter requested by the user. Defaults to "auto" so that the
   * system decides on their behalf.
   */
  simpPreference: SimpPreference;
}

const DEFAULT_PREFS: UserPrefs = {
  text: "",
  preferredCountry: "auto",
  simpPreference: "auto",
};

/**
 * Retrieves the public profile associated with the supplied user id.
 *
 * @throws Error – If the Supabase client is not initialised or the query fails.
 */
export async function getProfile(
  userId: string,
  client: SupabaseClient | null = supabaseAdmin
): Promise<UserProfile> {
  if (!client) {
    throw new Error("Supabase client not initialized");
  }

  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as UserProfile;
}

/**
 * Fetches the user preferences row for the provided user id. If the row does
 * not exist, the function returns a set of sensible defaults so that callers
 * do not have to deal with `null` checks.
 *
 * Any database error (for instance a network issue) is **not** swallowed – the
 * error is bubbled up so the caller can decide how to react.
 */
export async function getPreferences(
  userId: string,
  client: SupabaseClient | null = supabaseAdmin
): Promise<UserPrefs> {
  if (!client) {
    throw new Error("Supabase client not initialized");
  }

  // Attempt to read from the dedicated `preferences` table first.
  let { data, error } = await client
    .from("preferences")
    .select("text, preferred_country, simp_preference")
    .eq("user_id", userId)
    .single();

  // If there's a real database error (not "not found"), throw immediately
  if (error && error.code !== "PGRST116") {
    throw new Error(error.message);
  }

  // If the project has not yet migrated to the `preferences` table, fall back
  // to the legacy columns stored in the `profiles` table.
  if (error && error.code === "PGRST116" /* row not found */) {
    error = null;
    data = null;
  }

  // Legacy fallback
  if (!data) {
    const legacy = await client
      .from("profiles")
      .select("preferences, preferred_country, simp_preference")
      .eq("id", userId)
      .single();

    if (legacy.error && legacy.error.code !== "PGRST116") {
      // Real DB failure – bubble up.
      throw new Error(legacy.error.message);
    }

    data = legacy.data as any;
  }

  if (!data) {
    // No preferences stored for this user – return defaults.
    return { ...DEFAULT_PREFS };
  }

  // Handle the different column naming between the two tables (`text` vs `preferences`).
  const rawText = (data as any).text ?? (data as any).preferences ?? "";

  // Column may contain either plain text or a JSON stringifying an object with a `text` key.
  let parsedText = "";
  if (typeof rawText === "string") {
    try {
      const maybeObj = JSON.parse(rawText);
      if (maybeObj && typeof maybeObj === "object" && "text" in maybeObj) {
        parsedText = (maybeObj as any).text as string;
      } else {
        parsedText = rawText;
      }
    } catch {
      parsedText = rawText;
    }
  }

  const preferredCountry =
    typeof (data as any).preferred_country === "string"
      ? (data as any).preferred_country
      : "auto";

  const simpPreferenceRaw = (data as any).simp_preference;
  const validSimps: SimpPreference[] = ["auto", "low", "neutral", "high"];
  const simpPreference: SimpPreference = validSimps.includes(simpPreferenceRaw)
    ? (simpPreferenceRaw as SimpPreference)
    : "auto";

  return {
    text: parsedText,
    preferredCountry,
    simpPreference,
  };
}

/**
 * Updates user preferences in the profiles table.
 * Validates input parameters and performs the database update.
 *
 * @param userId - The user ID to update preferences for
 * @param preferences - The preference text (max 1000 characters)
 * @param preferredCountry - Optional preferred country (max 20 characters)
 * @param simpPreference - Optional simp preference setting
 * @param client - Optional Supabase client (defaults to supabaseAdmin)
 * @throws Error - If validation fails or database update fails
 */
export async function setPreferences(
  userId: string,
  preferences: string,
  preferredCountry?: string,
  simpPreference?: SimpPreference,
  client: SupabaseClient | null = supabaseAdmin
): Promise<void> {
  if (!client) {
    throw new Error("Supabase client not initialized");
  }

  // Validate preferences text
  if (typeof preferences !== "string" || preferences.length > 1000) {
    throw new Error(
      "Invalid preferences: must be a string with max 1000 characters"
    );
  }

  // Build update object
  const updateObj: any = { preferences };

  // Validate and add preferred country if provided
  if (preferredCountry !== undefined) {
    if (typeof preferredCountry !== "string" || preferredCountry.length > 20) {
      throw new Error(
        "Invalid preferred country: must be a string with max 20 characters"
      );
    }
    updateObj.preferred_country = preferredCountry;
  }

  // Validate and add simp preference if provided
  if (simpPreference !== undefined) {
    const validSimps: SimpPreference[] = ["auto", "low", "neutral", "high"];
    if (!validSimps.includes(simpPreference)) {
      throw new Error(
        "Invalid simp preference: must be one of auto, low, neutral, high"
      );
    }
    updateObj.simp_preference = simpPreference;
  }

  // Perform the update
  const { error } = await client
    .from("profiles")
    .update(updateObj)
    .eq("id", userId);

  if (error) {
    throw new Error(`Failed to update preferences: ${error.message}`);
  }
}
