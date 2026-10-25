
import express from "express";
import dotenv from "dotenv";
import { pool } from "./config/db.js";
import authRouter from "./modules/auth/auth.route.js";
import { authenticate } from "./middleware/auth.middleware.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(express.json());

// Auth routes
app.use("/api/auth", authRouter);

// Database health check
app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");

    res.status(200).json({
      success: true,
      message: "DevPulse API and database are working",
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

app.get("/api/auth/me", authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Authentication successful",
    data: {
      user: req.user,
    },
  });
});

app.listen(PORT, () => {
  console.log(`DevPulse API running on port ${PORT}`);
});
