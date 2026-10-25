// Set up this app on Neon.
// 1. `npm i -g neon@latest`. If that fails, use `npx neon@latest` in place of `neon`.
//    If a neon command opens a browser sign-in, tell me to finish it there. If that times out or fails, ask me to run `neon login`, then retry.
// 2. In the project root:
//    neon init -y --org-id org-mute-dawn-03969320 --project-id falling-lab-02150205 --branch production --services postgres
// 3. `neon deploy`. It provisions the services in neon.ts and pulls their env vars into `.env.local` (or `.env` if it exists).
// 4. Wire each service into the app's code using those env vars. Consult the installed Neon agent skills for best practices, e.g., what database driver to use given the app architecture and hosting runtime.
// 5. Prove it works: `npm run build` must pass, then start the app, each wired service must be tested to prove it works end to end.
// 6. Report what changed, the command output that proves step 5, and anything that failed.


import express from "express";
import dotenv from "dotenv";
import { pool } from "./config/db.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT);

app.use(express.json());

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
