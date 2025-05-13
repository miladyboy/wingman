import express from 'express';
import { getUserPreferences, updateUserPreferences } from '../controllers/userPreferencesController';

const router = express.Router();

router.get('/', getUserPreferences);
router.post('/', updateUserPreferences);

export default router; 