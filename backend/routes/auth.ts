import express from "express";
import { googleOAuthUrl } from "../controllers/authController";

/**
 * Express router for authentication routes.
 * Handles Google OAuth
 */
const router = express.Router();

router.get("/oauth/google", googleOAuthUrl);

export default router;
