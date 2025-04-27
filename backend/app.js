const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer');

// Load environment variables
dotenv.config();

const app = express();

// Set up multer for file uploads (memory storage)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

// CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = ['https://www.getharem.com', 'http://localhost:5173'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const analyzeRoutes = require('./routes/analyze');
app.use('/analyze', analyzeRoutes);
const inviteRoutes = require('./routes/invite');
app.use('/api/validate-invite-code', inviteRoutes);

module.exports = app; 