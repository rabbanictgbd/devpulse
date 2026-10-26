
import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { createIssue, deleteIssue, getAllIssues, getIssueById, updateIssue } from "./issues.controller.js";
import { requireMaintainer } from "../../middleware/role.middleware.js";

const router = Router();

router.get("/", getAllIssues);
router.get("/:id", getIssueById);
router.post("/", authenticate, createIssue);
router.patch("/:id", authenticate, updateIssue);
router.delete("/:id", authenticate, requireMaintainer, deleteIssue);

export default router;
