
import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

type UserRole = "contributor" | "maintainer";

export interface AuthenticatedUser {
  id: number;
  role: UserRole;
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.header("Authorization");

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Authentication token is required",
    });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    res.status(500).json({
      success: false,
      message: "Server configuration error",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);

    if (typeof decoded === "string") {
      res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
      return;
    }

    const payload = decoded as JwtPayload & {
      id?: unknown;
      role?: unknown;
    };

    if (
      typeof payload.id !== "number" ||
      (payload.role !== "contributor" &&
        payload.role !== "maintainer")
    ) {
      res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
      return;
    }

    req.user = {
      id: payload.id,
      role: payload.role,
    };

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
};
