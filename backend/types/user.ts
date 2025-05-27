/**
 * @fileoverview Shared user-domain types for profile and preferences.
 * Place all user-related enums and types here for DRYness and type safety.
 */

/**
 * User's SimpPreference setting.
 * - "auto": Let the system decide
 * - "low": Minimize simp content
 * - "neutral": No bias
 * - "high": Maximize simp content
 */
export type SimpPreference = "auto" | "low" | "neutral" | "high";

// Add other user-related types here as needed (e.g., UserProfile, UserPrefs)
