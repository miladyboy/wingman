import { Request, Response } from "express";
import { supabaseAdmin } from "../services/supabaseService";

const MAX_PREFERENCES_LENGTH = 1000;

export async function getUserPreferences(
  req: Request,
  res: Response
): Promise<void> {
  if (!supabaseAdmin) {
    res.status(500).json({ error: "Supabase client not initialized" });
    return;
  }
  const userId = req.auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("preferences, preferred_country, simp_preference")
    .eq("id", userId)
    .single();
  if (error) {
    res.status(500).json({ error: "Failed to fetch preferences" });
    return;
  }
  let preferences = data?.preferences || "";
  // If preferences is a JSON string, extract the text field, else use as is
  try {
    const parsed = JSON.parse(preferences);
    if (parsed && typeof parsed === "object" && parsed.text) {
      preferences = parsed.text;
    }
  } catch {
    /* ignore JSON parse errors, fallback to plain string */
  }
  res.json({
    preferences,
    preferredCountry: data?.preferred_country || "auto",
    simpPreference: data?.simp_preference || "auto",
  });
}

export async function updateUserPreferences(
  req: Request,
  res: Response
): Promise<void> {
  if (!supabaseAdmin) {
    res.status(500).json({ error: "Supabase client not initialized" });
    return;
  }
  const userId = req.auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  let { preferences, preferredCountry, simpPreference } = req.body;
  console.log("[updateUserPreferences] Received body:", req.body); // Debug log
  if (
    typeof preferences !== "string" ||
    preferences.length > MAX_PREFERENCES_LENGTH
  ) {
    res.status(400).json({ error: "Invalid preferences" });
    return;
  }
  // Only store preferences as plain text
  let preferencesToSave = preferences;
  const updateObj: any = { preferences: preferencesToSave };
  if (typeof preferredCountry === "string" && preferredCountry.length <= 20) {
    updateObj.preferred_country = preferredCountry;
  }
  if (
    typeof simpPreference === "string" &&
    ["auto", "low", "neutral", "high"].includes(simpPreference)
  ) {
    updateObj.simp_preference = simpPreference;
  }
  const { error } = await supabaseAdmin
    .from("profiles")
    .update(updateObj)
    .eq("id", userId);
  if (error) {
    res.status(500).json({ error: "Failed to update preferences" });
    return;
  }
  res.json({ success: true });
}
