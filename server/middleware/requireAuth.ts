import { Request, Response, NextFunction } from "express";
import { clerkMiddleware, getAuth } from "@clerk/express";

/**
 * Middleware that verifies the Clerk session token server-side.
 * Extracts clerk_user_id from the verified session and attaches it
 * to the request for downstream route handlers.
 * 
 * This runs AFTER clerkMiddleware() — which parses the session token
 * from the Authorization header — and rejects requests that don't
 * have a valid authenticated session.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = getAuth(req);

  if (!auth?.userId) {
    res.status(401).json({ error: "Unauthorized — no valid session" });
    return;
  }

  // Attach for downstream handlers
  (req as any).clerkUserId = auth.userId;
  next();
}
