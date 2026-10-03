import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import * as schema from "./schema.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

/**
 * Database connection using node-postgres Pool (NOT the Neon serverless driver).
 * This is a long-lived Express process, so a pooled TCP connection is correct.
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Sensible pool defaults for a single-instance Express server
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

export const db = drizzle(pool, { schema });
