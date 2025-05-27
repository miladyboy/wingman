/**
 * @fileoverview Unit tests for userPreferencesController.
 * Tests the controller's integration with userService.
 *
 * Note: Authentication tests are not needed here since requireAuth middleware
 * handles authentication before these controller functions are called.
 */

import { Request, Response } from "express";
import {
  getUserPreferences,
  updateUserPreferences,
} from "../userPreferencesController";

// Mock userService
jest.mock("../../services/userService", () => ({
  getPreferences: jest.fn(),
  setPreferences: jest.fn(),
}));

// Import the mocked functions after mocking
import { getPreferences, setPreferences } from "../../services/userService";
const mockGetPreferences = getPreferences as jest.MockedFunction<
  typeof getPreferences
>;
const mockSetPreferences = setPreferences as jest.MockedFunction<
  typeof setPreferences
>;

describe("userPreferencesController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonSpy: jest.Mock;
  let statusSpy: jest.Mock;

  beforeEach(() => {
    jsonSpy = jest.fn();
    statusSpy = jest.fn().mockReturnValue({ json: jsonSpy });

    // Authentication is guaranteed by middleware, so req.auth is always present
    req = {
      auth: {
        userId: "user-123",
        email: "test@example.com",
        roles: [],
      },
    };
    res = {
      json: jsonSpy,
      status: statusSpy,
    };

    jest.clearAllMocks();
  });

  describe("getUserPreferences", () => {
    it("returns user preferences successfully", async () => {
      const mockPrefs = {
        text: "I love cats",
        preferredCountry: "jp",
        simpPreference: "low" as const,
      };
      mockGetPreferences.mockResolvedValue(mockPrefs);

      await getUserPreferences(req as Request, res as Response);

      expect(mockGetPreferences).toHaveBeenCalledWith("user-123");
      expect(jsonSpy).toHaveBeenCalledWith({
        preferences: "I love cats",
        preferredCountry: "jp",
        simpPreference: "low",
      });
      expect(statusSpy).not.toHaveBeenCalled();
    });

    it("returns 500 when userService throws an error", async () => {
      mockGetPreferences.mockRejectedValue(
        new Error("Database connection failed")
      );

      await getUserPreferences(req as Request, res as Response);

      expect(mockGetPreferences).toHaveBeenCalledWith("user-123");
      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        error: "Failed to fetch preferences",
      });
    });

    it("returns default preferences when userService returns defaults", async () => {
      const defaultPrefs = {
        text: "",
        preferredCountry: "auto",
        simpPreference: "auto" as const,
      };
      mockGetPreferences.mockResolvedValue(defaultPrefs);

      await getUserPreferences(req as Request, res as Response);

      expect(mockGetPreferences).toHaveBeenCalledWith("user-123");
      expect(jsonSpy).toHaveBeenCalledWith({
        preferences: "",
        preferredCountry: "auto",
        simpPreference: "auto",
      });
    });
  });

  describe("updateUserPreferences", () => {
    beforeEach(() => {
      req.body = {
        preferences: "I love dogs",
        preferredCountry: "us",
        simpPreference: "high",
      };
    });

    it("updates user preferences successfully", async () => {
      mockSetPreferences.mockResolvedValue(undefined);

      await updateUserPreferences(req as Request, res as Response);

      expect(mockSetPreferences).toHaveBeenCalledWith(
        "user-123",
        "I love dogs",
        "us",
        "high"
      );
      expect(jsonSpy).toHaveBeenCalledWith({ success: true });
      expect(statusSpy).not.toHaveBeenCalled();
    });

    it("returns 400 for validation errors", async () => {
      mockSetPreferences.mockRejectedValue(
        new Error(
          "Invalid preferences: must be a string with max 1000 characters"
        )
      );

      await updateUserPreferences(req as Request, res as Response);

      expect(mockSetPreferences).toHaveBeenCalledWith(
        "user-123",
        "I love dogs",
        "us",
        "high"
      );
      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        error: "Invalid preferences: must be a string with max 1000 characters",
      });
    });

    it("returns 500 for database errors", async () => {
      mockSetPreferences.mockRejectedValue(
        new Error("Failed to update preferences: Database connection failed")
      );

      await updateUserPreferences(req as Request, res as Response);

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        error: "Failed to update preferences",
      });
    });

    it("updates preferences with only required parameters", async () => {
      req.body = {
        preferences: "Simple text",
      };
      mockSetPreferences.mockResolvedValue(undefined);

      await updateUserPreferences(req as Request, res as Response);

      expect(mockSetPreferences).toHaveBeenCalledWith(
        "user-123",
        "Simple text",
        undefined,
        undefined
      );
      expect(jsonSpy).toHaveBeenCalledWith({ success: true });
    });
  });
});
