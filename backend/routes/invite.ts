import express, { Router } from 'express';
const router: Router = express.Router();

const inviteController = require('../controllers/inviteController');

router.post('/', inviteController.validateInviteCode);

export default router; 