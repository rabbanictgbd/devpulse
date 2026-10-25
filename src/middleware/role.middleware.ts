
import type { Request, Response, NextFunction } from "express";

export const requireMaintainer = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  if (req.user.role !== "maintainer") {
    res.status(403).json({
      success: false,
      message: "Maintainer permission required",
    });
    return;
  }

  next();
};
