import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// JetSki status enum
export const JetSkiStatus = {
  AVAILABLE: "available",
  IN_USE: "in_use",
  REFUELING: "refueling",
  MAINTENANCE: "maintenance",
  BROKEN: "broken",
} as const;

export type JetSkiStatusType = typeof JetSkiStatus[keyof typeof JetSkiStatus];

// Booking status enum
export const BookingStatus = {
  SCHEDULED: "scheduled",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  INTERRUPTED: "interrupted",
} as const;

export type BookingStatusType = typeof BookingStatus[keyof typeof BookingStatus];

// Maintenance type enum
export const MaintenanceType = {
  MAINTENANCE: "maintenance",
  REFUELING: "refueling",
  REPAIRS: "repairs",
  OTHER: "other",
} as const;

export type MaintenanceTypeType = typeof MaintenanceType[keyof typeof MaintenanceType];

// Define the JetSki table
export const jetSkis = pgTable("jet_skis", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  status: text("status").notNull().$type<JetSkiStatusType>().default(JetSkiStatus.AVAILABLE),
  lastMaintenanceDate: timestamp("last_maintenance_date"),
  hoursUsed: integer("hours_used").default(0),
});

// Define the Booking table
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone"),
  jetSkiId: integer("jet_ski_id").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: text("status").notNull().$type<BookingStatusType>().default(BookingStatus.SCHEDULED),
  notes: text("notes"),
});

// Define the Maintenance table
export const maintenanceSchedule = pgTable("maintenance_schedule", {
  id: serial("id").primaryKey(),
  jetSkiId: integer("jet_ski_id").notNull(),
  type: text("type").notNull().$type<MaintenanceTypeType>(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  completed: boolean("completed").default(false),
  notes: text("notes"),
});

// Create insert schemas
export const insertJetSkiSchema = createInsertSchema(jetSkis).pick({
  name: true,
  brand: true,
  status: true,
  lastMaintenanceDate: true,
  hoursUsed: true,
});

export const insertBookingSchema = createInsertSchema(bookings).pick({
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  jetSkiId: true,
  startTime: true,
  endTime: true,
  status: true,
  notes: true,
});

export const insertMaintenanceSchema = createInsertSchema(maintenanceSchedule).pick({
  jetSkiId: true,
  type: true,
  startTime: true,
  endTime: true,
  completed: true,
  notes: true,
});

// Export types
export type JetSki = typeof jetSkis.$inferSelect;
export type InsertJetSki = z.infer<typeof insertJetSkiSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type Maintenance = typeof maintenanceSchedule.$inferSelect;
export type InsertMaintenance = z.infer<typeof insertMaintenanceSchema>;

// Extend user schema for backwards compatibility
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
