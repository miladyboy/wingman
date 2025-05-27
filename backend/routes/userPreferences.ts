import express from "express";
import {
  getUserPreferences,
  updateUserPreferences,
} from "../controllers/userPreferencesController";
import { requireAuth } from "../middleware/requireAuth";

const router = express.Router();

/**
 * Express router for user preferences.
 * Handles GET and POST requests for user preferences.
 * Requires authentication for all routes.
 */
router.get("/", requireAuth, getUserPreferences);
router.post("/", requireAuth, updateUserPreferences);

export default router;
