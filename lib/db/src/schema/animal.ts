import { createInsertSchema } from "drizzle-zod";
import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const animalsTable = pgTable("animals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  species: text("species").notNull(),
  breed: text("breed").notNull(),
  age: text("age").notNull(),
  location: text("location").notNull(),
  status: text("status").notNull(),
  imageUrl: text("image_url").notNull(),
  description: text("description").notNull(),
  vaccinated: boolean("vaccinated").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAnimalSchema = createInsertSchema(animalsTable).omit({ id: true, createdAt: true });
export type InsertAnimal = z.infer<typeof insertAnimalSchema>;
export type Animal = typeof animalsTable.$inferSelect;