import express, { Router } from 'express';
const router: Router = express.Router();

import { validateInviteCode } from '../controllers/inviteController';

router.post('/', validateInviteCode as any);

export default router; 