/**
 * @fileoverview Unit tests for userService.
 * Tests preference retrieval with mocked Supabase client.
 */

import type { UserPrefs } from "../../services/userService";
import type { SimpPreference } from "../../types/user";

// Mock Supabase
const mockFrom = jest.fn();
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();
const mockUpdate = jest.fn();

const mockSupabaseClient = {
  from: mockFrom,
};

jest.mock("../../services/supabaseService", () => ({
  supabaseAdmin: mockSupabaseClient,
}));

describe("userService", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock chain
    mockFrom.mockReturnValue({
      select: mockSelect,
      update: mockUpdate,
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockUpdate.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      single: mockSingle,
    });
  });

  describe("getPreferences", () => {
    it("returns user preferences successfully", async () => {
      const { getPreferences } = await import("../../services/userService");

      // Mock preferences table response
      mockSingle.mockResolvedValueOnce({
        data: {
          text: "I love cats",
          preferred_country: "jp",
          simp_preference: "low",
        },
        error: null,
      });

      const result = await getPreferences("user-123");

      expect(mockFrom).toHaveBeenCalledWith("preferences");
      expect(mockSelect).toHaveBeenCalledWith(
        "text, preferred_country, simp_preference"
      );
      expect(mockEq).toHaveBeenCalledWith("user_id", "user-123");
      expect(result).toEqual({
        text: "I love cats",
        preferredCountry: "jp",
        simpPreference: "low",
      });
    });

    it("returns default preferences when no data exists", async () => {
      const { getPreferences } = await import("../../services/userService");

      // Mock preferences table not found
      mockSingle
        .mockResolvedValueOnce({
          data: null,
          error: { code: "PGRST116" },
        })
        // Mock profiles table not found
        .mockResolvedValueOnce({
          data: null,
          error: { code: "PGRST116" },
        });

      const result = await getPreferences("user-123");

      expect(result).toEqual({
        text: "",
        preferredCountry: "auto",
        simpPreference: "auto",
      });
    });

    it("throws error when database fails", async () => {
      const { getPreferences } = await import("../../services/userService");

      // Mock preferences table with real database error (not "not found")
      // When there's a real DB error, it should throw immediately, not continue to legacy
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: {
          code: "CONNECTION_ERROR",
          message: "Database connection failed",
        },
      });

      // The function should throw immediately after the first query fails with a real error
      // It should NOT continue to the legacy fallback path
      await expect(getPreferences("user-123")).rejects.toThrow(
        "Database connection failed"
      );
    });

    it("falls back to profiles table when preferences table has no data", async () => {
      const { getPreferences } = await import("../../services/userService");

      // Mock preferences table not found, then profiles table with data
      mockSingle
        .mockResolvedValueOnce({
          data: null,
          error: { code: "PGRST116" },
        })
        .mockResolvedValueOnce({
          data: {
            preferences: "I love dogs",
            preferred_country: "us",
            simp_preference: "high",
          },
          error: null,
        });

      const result = await getPreferences("user-123");

      expect(result).toEqual({
        text: "I love dogs",
        preferredCountry: "us",
        simpPreference: "high",
      });
    });
  });

  describe("setPreferences", () => {
    it("updates preferences successfully", async () => {
      const { setPreferences } = await import("../../services/userService");

      mockEq.mockResolvedValueOnce({
        error: null,
      });

      await setPreferences("user-123", "I love dogs", "us", "high");

      expect(mockFrom).toHaveBeenCalledWith("profiles");
      expect(mockUpdate).toHaveBeenCalledWith({
        preferences: "I love dogs",
        preferred_country: "us",
        simp_preference: "high",
      });
      expect(mockEq).toHaveBeenCalledWith("id", "user-123");
    });

    it("updates preferences with only required parameters", async () => {
      const { setPreferences } = await import("../../services/userService");

      mockEq.mockResolvedValueOnce({
        error: null,
      });

      await setPreferences("user-123", "Simple preferences");

      expect(mockUpdate).toHaveBeenCalledWith({
        preferences: "Simple preferences",
      });
    });

    it("throws error for invalid preferences text", async () => {
      const { setPreferences } = await import("../../services/userService");

      const longText = "a".repeat(1001);
      await expect(setPreferences("user-123", longText)).rejects.toThrow(
        "Invalid preferences: must be a string with max 1000 characters"
      );
    });

    it("throws error for invalid preferred country", async () => {
      const { setPreferences } = await import("../../services/userService");

      const longCountry = "a".repeat(21);
      await expect(
        setPreferences("user-123", "text", longCountry)
      ).rejects.toThrow(
        "Invalid preferred country: must be a string with max 20 characters"
      );
    });

    it("throws error for invalid simp preference", async () => {
      const { setPreferences } = await import("../../services/userService");

      await expect(
        setPreferences("user-123", "text", "us", "invalid" as SimpPreference)
      ).rejects.toThrow(
        "Invalid simp preference: must be one of auto, low, neutral, high"
      );
    });

    it("throws error when database update fails", async () => {
      const { setPreferences } = await import("../../services/userService");

      mockEq.mockResolvedValueOnce({
        error: { message: "Update failed" },
      });

      await expect(setPreferences("user-123", "text")).rejects.toThrow(
        "Failed to update preferences: Update failed"
      );
    });

    it("throws error when Supabase client is not initialized", async () => {
      const { setPreferences } = await import("../../services/userService");

      await expect(
        setPreferences("user-123", "text", undefined, undefined, null)
      ).rejects.toThrow("Supabase client not initialized");
    });
  });
});
