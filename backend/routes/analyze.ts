import express, { Router } from 'express';
import multer from 'multer';
const router: Router = express.Router();

// Set up multer for file uploads (memory storage)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

const analyzeController = require('../controllers/analyzeController');

router.post('/', upload.array('images', 5), analyzeController.analyze);

export default router;
// For CommonJS compatibility
module.exports = router; 