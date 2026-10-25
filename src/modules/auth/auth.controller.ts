
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { pool } from "../../config/db.js";

type UserRole = "contributor" | "maintainer";

interface SignupBody {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

interface PublicUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export const signup = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const body = req.body as Partial<SignupBody>;

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const role = body.role ?? "contributor";

    // 1. Validate input
    if (
      !name ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
      return;
    }

    if (name.length > 150 || password.length < 8) {
      res.status(400).json({
        success: false,
        message: "Invalid name or password length",
      });
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 255
    ) {
      res.status(400).json({
        success: false,
        message: "Please provide a valid email",
      });
      return;
    }

    if (role !== "contributor" && role !== "maintainer") {
      res.status(400).json({
        success: false,
        message: "Invalid user role",
      });
      return;
    }

    // 2. Check duplicate email
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
      return;
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Save user and return only public fields
    const result = await pool.query<PublicUser>(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at, updated_at`,
      [name, email, hashedPassword, role]
    );

    // 5. Send safe response
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result.rows[0],
    });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
      return;
    }

    console.error("Signup failed");

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
