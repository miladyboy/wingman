import express from 'express';
import { googleOAuthUrl } from '../controllers/authController';

const router = express.Router();

router.get('/google', googleOAuthUrl);

export default router;
