import { createInsertSchema } from "drizzle-zod";
import { pgTable, serial, integer, text } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const appointmentsTable = pgTable("appointments", {
  id: serial("id").primaryKey(),
  vetId: integer("vet_id").notNull(),
  animalName: text("animal_name").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("scheduled"),
});

export const insertAppointmentSchema = createInsertSchema(appointmentsTable).omit({ id: true });
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointmentsTable.$inferSelect;