import express, { Express } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import analyzeRoutes from './routes/analyze';
import inviteRoutes from './routes/invite';

// Load environment variables
dotenv.config();

const app: Express = express();

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

app.use('/analyze', analyzeRoutes);
app.use('/api/validate-invite-code', inviteRoutes);

export default app;
