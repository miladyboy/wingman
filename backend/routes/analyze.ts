import express, { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/requireAuth";

const router: Router = express.Router();

/**
 * Express router for analysis endpoints.
 * Provides routes for analyzing text and chat conversations.
 * All routes require authentication.
 */

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const analyzeController = require("../controllers/analyzeController");

router.post(
  "/",
  requireAuth,
  upload.array("images", 5),
  analyzeController.analyze
);

export default router;
