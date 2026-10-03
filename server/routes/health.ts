import { Router, Request, Response } from "express";

const router = Router();

/**
 * GET /api/health
 * Simple health check for uptime monitoring (e.g., Render cron pinger).
 * Returns 200 with a JSON body — no auth required.
 */
router.get("/", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

export default router;
