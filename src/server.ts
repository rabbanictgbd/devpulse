

import express from "express";
import dotenv from "dotenv";
import { pool } from "./config/db.js";
import authRouter from "./modules/auth/auth.route.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT);

app.use(express.json());

app.use("/api/auth", authRouter)

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
app.get("/api/users", async (_req, res) => {
  try {
    await pool.query(
      `CREATE TABLE users (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'contributor'
        CHECK (role IN ('contributor', 'maintainer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);`
    );

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



app.listen(PORT, () => {
  console.log(`DevPulse API running on port ${PORT}`);
});
