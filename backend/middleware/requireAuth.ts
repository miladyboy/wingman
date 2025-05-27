import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../services/authService";

/**
 * Express middleware that validates the `Authorization: Bearer <token>` header.
 * If the token is valid, the decoded payload is attached to `req.auth`.
 * If the header is missing or invalid, a 401 response is sent.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const token = authHeader.split(" ")[1];
    const payload = await verifyToken(token);
    // Attach to request for downstream handlers
    (req as any).auth = payload;
    return next();
  } catch (err) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
}
