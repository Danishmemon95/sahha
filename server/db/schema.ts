import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Users table — mirrors Clerk user records in our own database.
 * Populated via Clerk webhooks on `user.created` events.
 * clerk_user_id is the authoritative link to Clerk's identity.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkUserId: text("clerk_user_id").unique().notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Waitlist table — anonymous signups from the landing page.
 * Completely decoupled from auth/users — visitors can join
 * the waitlist without creating a Clerk account.
 */
export const waitlist = pgTable("waitlist", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
