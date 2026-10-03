import { Router, Request, Response } from "express";
import { Webhook } from "svix";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";

const router = Router();

/**
 * POST /api/webhooks/clerk
 * 
 * Clerk fires this endpoint on user lifecycle events (user.created, user.updated, etc.).
 * We only handle `user.created` to sync new users into our own `users` table.
 * 
 * Security: Every request is verified against Clerk's webhook signing secret
 * using the svix library. This ensures the payload genuinely came from Clerk
 * and hasn't been tampered with.
 * 
 * Idempotency: Uses ON CONFLICT DO NOTHING on clerk_user_id, so retried
 * deliveries from Clerk don't cause duplicate rows or errors.
 * 
 * IMPORTANT: This route must receive the raw body (not JSON-parsed) for
 * signature verification to work. The Express app must NOT apply express.json()
 * to this path — we handle raw body parsing separately.
 */
router.post("/", async (req: Request, res: Response) => {
  const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

  if (!signingSecret) {
    console.error("CLERK_WEBHOOK_SIGNING_SECRET is not configured");
    res.status(500).json({ error: "Webhook secret not configured" });
    return;
  }

  // Extract Svix verification headers
  const svixId = req.headers["svix-id"] as string;
  const svixTimestamp = req.headers["svix-timestamp"] as string;
  const svixSignature = req.headers["svix-signature"] as string;

  if (!svixId || !svixTimestamp || !svixSignature) {
    res.status(400).json({ error: "Missing svix verification headers" });
    return;
  }

  const wh = new Webhook(signingSecret);
  let event: any;

  try {
    // req.body is the raw Buffer here (thanks to express.raw() on this route)
    event = wh.verify(req.body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    res.status(400).json({ error: "Invalid webhook signature" });
    return;
  }

  // Only handle user.created — ignore other event types
  if (event.type === "user.created") {
    const { id: clerkUserId, email_addresses } = event.data;

    // Clerk users can have multiple email addresses; take the primary one
    const primaryEmail =
      email_addresses?.find((e: any) => e.id === event.data.primary_email_address_id)?.email_address ||
      email_addresses?.[0]?.email_address;

    if (!primaryEmail) {
      console.error("user.created event missing email for clerk user:", clerkUserId);
      res.status(400).json({ error: "No email found in user.created event" });
      return;
    }

    try {
      // Upsert: insert if new, do nothing on duplicate clerk_user_id.
      // This makes the handler idempotent against Clerk's retry logic.
      await db
        .insert(users)
        .values({
          clerkUserId,
          email: primaryEmail,
        })
        .onConflictDoNothing({ target: users.clerkUserId });

      console.log(`Synced Clerk user ${clerkUserId} → local users table`);
    } catch (error) {
      console.error("Failed to sync user to database:", error);
      res.status(500).json({ error: "Failed to sync user" });
      return;
    }
  }

  res.status(200).json({ received: true });
});

export default router;
