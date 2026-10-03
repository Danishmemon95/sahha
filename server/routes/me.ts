import { Router, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

/**
 * GET /api/me
 * 
 * Protected endpoint — returns the authenticated user's data from our
 * own PostgreSQL database (NOT from Clerk's client-side session).
 * 
 * This is the critical flow: the frontend must display email and signup
 * date from our DB, proving the webhook-based sync worked correctly.
 * 
 * The requireAuth middleware has already verified the Clerk session and
 * attached clerkUserId to the request.
 */
router.get("/", requireAuth, async (req: Request, res: Response) => {
  const clerkUserId = (req as any).clerkUserId as string;

  try {
    const user = await db
      .select({
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId))
      .limit(1);

    if (user.length === 0) {
      // User exists in Clerk but hasn't been synced yet (webhook delay/failure).
      // This is a known race condition — the frontend should handle it gracefully.
      res.status(404).json({
        error: "User not yet synced",
        message: "Your account is being set up. Please try again in a moment.",
      });
      return;
    }

    res.json({
      email: user[0].email,
      createdAt: user[0].createdAt,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
