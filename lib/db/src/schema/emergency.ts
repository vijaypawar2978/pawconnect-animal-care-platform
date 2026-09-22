import { createInsertSchema } from "drizzle-zod";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const emergenciesTable = pgTable("emergencies", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  status: text("status").notNull().default("open"),
  urgency: text("urgency").notNull().default("high"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertEmergencySchema = createInsertSchema(emergenciesTable).omit({ id: true, createdAt: true });
export type InsertEmergency = z.infer<typeof insertEmergencySchema>;
export type Emergency = typeof emergenciesTable.$inferSelect;