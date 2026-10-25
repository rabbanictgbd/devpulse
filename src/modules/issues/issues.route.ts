
import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { createIssue, getAllIssues, getIssueById } from "./issues.controller.js";

const router = Router();

router.get("/", getAllIssues);
router.get("/:id", getIssueById);
router.post("/", authenticate, createIssue);

export default router;
