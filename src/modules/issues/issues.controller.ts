
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
