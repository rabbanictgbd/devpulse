
import type { Request, Response } from "express";
import { pool } from "../../config/db.js";
import type {
  CreateIssueBody,
  Issue,
} from "./issues.types.js";

export const createIssue = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const body = req.body as Partial<CreateIssueBody>;

    if (
      typeof body.title !== "string" ||
      typeof body.description !== "string" ||
      !body.title.trim() ||
      !body.description.trim()
    ) {
      res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
      return;
    }

    const title = body.title.trim();
    const description = body.description.trim();

    if (title.length > 200) {
      res.status(400).json({
        success: false,
        message: "Title cannot exceed 200 characters",
      });
      return;
    }

    const result = await pool.query<Issue>(
      `INSERT INTO issues (title, description, reporter_id)
       VALUES ($1, $2, $3)
       RETURNING id, title, description, status,
                 reporter_id, created_at, updated_at`,
      [title, description, req.user.id]
    );

    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: result.rows[0],
    });
  } catch (error: unknown) {
    console.error("Issue creation failed:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const getAllIssues = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await pool.query<Issue>(
      `SELECT id, title, description, status,
              reporter_id, created_at, updated_at
       FROM issues
       ORDER BY created_at DESC`
    );

    res.status(200).json({
      success: true,
      message: "Issues retrieved successfully",
      data: result.rows,
    });
  } catch (error: unknown) {
    console.error("Fetching issues failed:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const getIssueById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      res.status(400).json({
        success: false,
        message: "Invalid issue ID",
      });
      return;
    }

    const result = await pool.query<Issue>(
      `SELECT id, title, description, status,
              reporter_id, created_at, updated_at
       FROM issues
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "Issue not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Issue retrieved successfully",
      data: result.rows[0],
    });
  } catch (error: unknown) {
    console.error("Fetching issue failed:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const updateIssue = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      res.status(400).json({
        success: false,
        message: "Invalid issue ID",
      });
      return;
    }

    const body = req.body as {
      title?: unknown;
      description?: unknown;
      status?: unknown;
    };

    const allowedKeys = ["title", "description", "status"];
    const suppliedKeys = Object.keys(body);

    if (
      suppliedKeys.length === 0 ||
      suppliedKeys.some((key) => !allowedKeys.includes(key))
    ) {
      res.status(400).json({
        success: false,
        message: "Provide valid fields to update",
      });
      return;
    }

    if (
      body.title !== undefined &&
      (typeof body.title !== "string" ||
        !body.title.trim() ||
        body.title.trim().length > 200)
    ) {
      res.status(400).json({
        success: false,
        message: "Title must be 1–200 characters",
      });
      return;
    }

    if (
      body.description !== undefined &&
      (typeof body.description !== "string" ||
        !body.description.trim())
    ) {
      res.status(400).json({
        success: false,
        message: "Description must not be empty",
      });
      return;
    }

    if (
      body.status !== undefined &&
      body.status !== "open" &&
      body.status !== "in_progress" &&
      body.status !== "closed"
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid issue status",
      });
      return;
    }

    const existing = await pool.query<Pick<
      Issue,
      "id" | "reporter_id" | "status"
    >>(
      `SELECT id, reporter_id, status
       FROM issues
       WHERE id = $1`,
      [id]
    );

    const issue = existing.rows[0];

    if (!issue) {
      res.status(404).json({
        success: false,
        message: "Issue not found",
      });
      return;
    }

    const isMaintainer = req.user.role === "maintainer";
    const isOwner = issue.reporter_id === req.user.id;

    if (!isMaintainer && !isOwner) {
      res.status(403).json({
        success: false,
        message: "You can only update your own issues",
      });
      return;
    }

    if (!isMaintainer && issue.status !== "open") {
      res.status(403).json({
        success: false,
        message: "You can only update open issues",
      });
      return;
    }

    const title =
      body.title === undefined ? undefined : body.title.trim();

    const description =
      body.description === undefined
        ? undefined
        : body.description.trim();

    const result = await pool.query<Issue>(
      `UPDATE issues
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           updated_at = NOW()
       WHERE id = $4
       RETURNING id, title, description, status,
                 reporter_id, created_at, updated_at`,
      [title ?? null, description ?? null, body.status ?? null, id]
    );

    res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: result.rows[0],
    });
  } catch (error: unknown) {
    console.error("Issue update failed:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
