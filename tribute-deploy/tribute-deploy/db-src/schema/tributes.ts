import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tributesTable = pgTable("tributes", {
  id: serial("id").primaryKey(),
  authorName: text("author_name").notNull(),
  relationship: text("relationship").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTributeSchema = createInsertSchema(tributesTable).omit({ id: true, createdAt: true }).extend({
  authorName: z.string().min(1).max(100),
  relationship: z.string().min(1).max(100),
  message: z.string().min(1).max(2000),
});

export type InsertTribute = z.infer<typeof insertTributeSchema>;
export type Tribute = typeof tributesTable.$inferSelect;
