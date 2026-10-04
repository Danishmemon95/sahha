import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { clerkMiddleware } from "@clerk/express";

// Routes
import healthRouter from "./routes/health.js";
import waitlistRouter from "./routes/waitlist.js";
import webhooksRouter from "./routes/webhooks.js";
import meRouter from "./routes/me.js";

// Load environment variables from project root (support running from root, server/, or server/dist/)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Global Middleware ──────────────────────────────────────────────

// CORS — in production the frontend is served from the same origin,
// so this is mainly for local development where Vite runs on :5173
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" ? false : "http://localhost:5173",
    credentials: true,
  })
);

// Clerk middleware — parses session tokens from Authorization header.
// Must be applied BEFORE routes that use requireAuth.
app.use(clerkMiddleware());

// ─── Webhook Route (must be BEFORE express.json()) ──────────────────
// Svix signature verification requires the raw body bytes.
// If express.json() parses the body first, the signature won't match.
app.use("/api/webhooks/clerk", express.raw({ type: "application/json" }), webhooksRouter);

// ─── JSON Body Parser (for all other routes) ────────────────────────
app.use(express.json());

// ─── API Routes ─────────────────────────────────────────────────────
app.use("/api/health", healthRouter);
app.use("/api/waitlist", waitlistRouter);
app.use("/api/me", meRouter);

// ─── Serve Built Frontend (production only) ─────────────────────────
// In production, Express serves the Vite-built React app as static files.
// All non-API routes fall through to index.html for client-side routing.
const possibleClientDistPaths = [
  path.resolve(__dirname, "../../client/dist"), // when running compiled code from server/dist/
  path.resolve(__dirname, "../client/dist"),    // when running TypeScript via tsx from server/
  path.resolve(process.cwd(), "client/dist"),
  path.resolve(process.cwd(), "../client/dist"),
];

const clientDistPath =
  possibleClientDistPaths.find((p) => fs.existsSync(p)) ||
  possibleClientDistPaths[0];

app.use(express.static(clientDistPath));

app.get("{*path}", (_req, res) => {
  res.sendFile(path.join(clientDistPath, "index.html"));
});

// ─── Start Server ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✓ Sahha AI server running on port ${PORT}`);
  console.log(`  Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;
