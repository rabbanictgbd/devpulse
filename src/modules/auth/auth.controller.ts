
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { pool } from "../../config/db.js";
import jwt from "jsonwebtoken";

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



export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const email =
      typeof req.body?.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    const password =
      typeof req.body?.password === "string"
        ? req.body.password
        : "";

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
      return;
    }

    const result = await pool.query(
      `SELECT id, name, email, password, role,
              created_at, updated_at
       FROM users
       WHERE email = $1`,
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("JWT_SECRET is missing");
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
      },
    });
  } catch {
    console.error("Login failed");

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

