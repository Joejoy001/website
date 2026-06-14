import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const attendanceValues = [
  "Yes, I will attend in person",
  "I will attend virtually",
  "No, I will not be able to attend",
] as const;

export const rsvpTable = pgTable("rsvp", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  attendance: text("attendance").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRsvpSchema = createInsertSchema(rsvpTable)
  .omit({ id: true, createdAt: true })
  .extend({
    fullName: z.string().min(1).max(150),
    phone: z.string().min(1).max(30),
    attendance: z.enum(attendanceValues),
  });

export type InsertRsvp = z.infer<typeof insertRsvpSchema>;
export type Rsvp = typeof rsvpTable.$inferSelect;
