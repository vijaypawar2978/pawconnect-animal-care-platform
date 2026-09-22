import { createInsertSchema } from "drizzle-zod";
import { pgTable, serial, text, date } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const reportsTable = pgTable("reports", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  date: date("date", { mode: "string" }).notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("open"),
  imageUrl: text("image_url").notNull(),
});

export const insertReportSchema = createInsertSchema(reportsTable).omit({ id: true });
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reportsTable.$inferSelect;