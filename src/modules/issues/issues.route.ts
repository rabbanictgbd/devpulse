
import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { createIssue } from "./issues.controller.js";

const router = Router();

router.post("/", authenticate, createIssue);

export default router;
