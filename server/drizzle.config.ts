import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from project root (one level up from server/)
dotenv.config({ path: path.resolve(__dirname, "../.env") });

export default defineConfig({
  schema: "./db/schema.ts",
  out: "../drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
