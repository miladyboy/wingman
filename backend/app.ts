import express, { Express } from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import analyzeRoutes from "./routes/analyze";
// import inviteRoutes from './routes/invite';
import paymentsRoutes from "./routes/payments";
import stripeWebhookRoutes from "./routes/stripeWebhook";
import userPreferencesRoutes from "./routes/userPreferences";
import authRoutes from "./routes/auth";

// Load environment variables from .env
dotenv.config();

const app: Express = express();

// Apply security-related HTTP headers
app.use(helmet());

// Register Stripe webhook route early to preserve raw body for signature verification
app.use("/api/stripe", stripeWebhookRoutes);

// CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "https://www.getharem.com",
        "http://localhost:5173",
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/analyze", analyzeRoutes);
// app.use('/api/validate-invite-code', inviteRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/user/preferences", userPreferencesRoutes);
app.use("/api/auth", authRoutes);

export default app;
