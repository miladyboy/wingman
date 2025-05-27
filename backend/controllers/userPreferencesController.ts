import { Request, Response } from "express";
import {
  getPreferences,
  UserPrefs,
  setPreferences,
} from "../services/userService";
import type { SimpPreference } from "../types/user";

/**
 * Retrieves user preferences via the userService layer.
 * Returns preferences, preferredCountry, and simpPreference.
 *
 * Note: Authentication is handled by requireAuth middleware,
 * so req.auth.userId is guaranteed to be present.
 */
export async function getUserPreferences(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const prefs: UserPrefs = await getPreferences(req.auth!.userId);
    res.json({
      preferences: prefs.text,
      preferredCountry: prefs.preferredCountry,
      simpPreference: prefs.simpPreference,
    });
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    res.status(500).json({ error: "Failed to fetch preferences" });
  }
}

/**
 * Updates user preferences in the database via the userService layer.
 *
 * Note: Authentication is handled by requireAuth middleware,
 * so req.auth.userId is guaranteed to be present.
 */
export async function updateUserPreferences(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { preferences, preferredCountry, simpPreference } = req.body;

    await setPreferences(
      req.auth!.userId,
      preferences,
      preferredCountry,
      simpPreference
    );

    res.json({ success: true });
  } catch (error: any) {
    console.error("Error updating user preferences:", error);

    // Handle validation errors vs database errors
    if (error.message.includes("Invalid")) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to update preferences" });
    }
  }
}
