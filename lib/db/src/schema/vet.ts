import { createInsertSchema } from "drizzle-zod";
import { pgTable, serial, text, numeric, boolean } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const vetsTable = pgTable("vets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  clinic: text("clinic").notNull(),
  distance: text("distance").notNull(),
  rating: numeric("rating", { precision: 2, scale: 1 }).notNull(),
  specialty: text("specialty").notNull(),
  availableToday: boolean("available_today").notNull().default(false),
});

export const insertVetSchema = createInsertSchema(vetsTable).omit({ id: true });
export type InsertVet = z.infer<typeof insertVetSchema>;
export type Vet = typeof vetsTable.$inferSelect;