import express from "express";
import {
  getUserPreferences,
  updateUserPreferences,
} from "../controllers/userPreferencesController";
import { requireAuth } from "../middleware/requireAuth";

const router = express.Router();

router.get("/", requireAuth, getUserPreferences);
router.post("/", requireAuth, updateUserPreferences);

export default router;
