
import express from "express";
import dotenv from "dotenv";
import { pool } from "./config/db.js";
import authRouter from "./modules/auth/auth.route.js";
import { authenticate } from "./middleware/auth.middleware.js";
import { requireMaintainer } from "./middleware/role.middleware.js";
import issuesRouter from "./modules/issues/issues.route.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/issues", issuesRouter);

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

app.get(
  "/api/auth/maintainer-test",
  authenticate,
  requireMaintainer,
  (_req, res) => {
    res.json({
      success: true,
      message: "Maintainer access granted",
    });
  }
);

export default app;
