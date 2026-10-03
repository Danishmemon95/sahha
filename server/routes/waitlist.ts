import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { waitlist } from "../db/schema.js";

const router = Router();

/**
 * Email validation — basic shape check, not RFC-complete.
 * Sufficient for a waitlist form; production would use a library.
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * POST /api/waitlist
 * Accepts { name, email } from anonymous visitors.
 * No auth required — the waitlist is independent of Clerk accounts.
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;

    // Input validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      res.status(400).json({ error: "Name is required" });
      return;
    }

    if (!email || typeof email !== "string" || !isValidEmail(email.trim())) {
      res.status(400).json({ error: "A valid email is required" });
      return;
    }

    await db.insert(waitlist).values({
      name: name.trim(),
      email: email.trim().toLowerCase(),
    });

    res.status(201).json({ message: "Successfully joined the waitlist" });
  } catch (error) {
    console.error("Waitlist insertion error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
