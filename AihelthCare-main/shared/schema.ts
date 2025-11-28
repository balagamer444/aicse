import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  bloodType: varchar("blood_type", { length: 10 }),
  phone: varchar("phone"),
  emergencyContact: varchar("emergency_contact"),
  medicalConditions: text("medical_conditions").array(),
  allergies: text("allergies").array(),
  isBloodDonor: boolean("is_blood_donor").default(false),
  isOrganDonor: boolean("is_organ_donor").default(false),
  organDonationPreferences: text("organ_donation_preferences").array(),
  lastBloodDonation: timestamp("last_blood_donation"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const doctors = pgTable("doctors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  specialization: varchar("specialization").notNull(),
  licenseNumber: varchar("license_number").notNull().unique(),
  hospitalAffiliation: varchar("hospital_affiliation"),
  isAvailable: boolean("is_available").default(true),
  consultationFee: decimal("consultation_fee", { precision: 10, scale: 2 }),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("5.00"),
  totalConsultations: integer("total_consultations").default(0),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  doctorId: varchar("doctor_id").references(() => doctors.id),
  message: text("message").notNull(),
  isFromAI: boolean("is_from_ai").default(false),
  isFromDoctor: boolean("is_from_doctor").default(false),
  messageType: varchar("message_type").default("text"), // text, image, file
  metadata: jsonb("metadata"), // AI analysis, confidence scores, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export const emergencyLogs = pgTable("emergency_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  emergencyType: varchar("emergency_type").notNull(), // low, medium, high
  symptoms: text("symptoms").array(),
  aiAssessment: jsonb("ai_assessment"),
  actionTaken: varchar("action_taken"), // self_care, consultation, emergency_call
  isResolved: boolean("is_resolved").default(false),
  assignedDoctorId: varchar("assigned_doctor_id").references(() => doctors.id),
  emergencyContact: varchar("emergency_contact"),
  location: varchar("location"),
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const diseasesPredictions = pgTable("diseases_predictions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  symptoms: text("symptoms").array().notNull(),
  duration: varchar("duration"),
  severity: integer("severity"), // 1-10
  predictions: jsonb("predictions"), // [{disease: string, confidence: number}]
  aiAnalysis: text("ai_analysis"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bloodDonationRequests = pgTable("blood_donation_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requesterId: varchar("requester_id").references(() => users.id),
  bloodType: varchar("blood_type").notNull(),
  urgencyLevel: varchar("urgency_level").notNull(), // low, medium, high, critical
  unitsNeeded: integer("units_needed").notNull(),
  hospitalName: varchar("hospital_name").notNull(),
  location: varchar("location").notNull(),
  contactInfo: varchar("contact_info").notNull(),
  medicalReason: text("medical_reason"),
  isActive: boolean("is_active").default(true),
  isFulfilled: boolean("is_fulfilled").default(false),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  fulfilledAt: timestamp("fulfilled_at"),
});

export const bloodDonationResponses = pgTable("blood_donation_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requestId: varchar("request_id").references(() => bloodDonationRequests.id),
  donorId: varchar("donor_id").references(() => users.id),
  status: varchar("status").default("pending"), // pending, confirmed, completed, cancelled
  scheduledDate: timestamp("scheduled_date"),
  donationCenter: varchar("donation_center"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const organDonationMatches = pgTable("organ_donation_matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  donorId: varchar("donor_id").references(() => users.id),
  recipientId: varchar("recipient_id").references(() => users.id),
  organType: varchar("organ_type").notNull(),
  matchScore: decimal("match_score", { precision: 5, scale: 2 }),
  status: varchar("status").default("potential"), // potential, under_review, approved, transplanted
  hospitalId: varchar("hospital_id"),
  medicalNotes: text("medical_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  transplantedAt: timestamp("transplanted_at"),
});

export const healthProducts = pgTable("health_products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: varchar("image_url"),
  inStock: boolean("in_stock").default(true),
  stockQuantity: integer("stock_quantity").default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("5.00"),
  totalReviews: integer("total_reviews").default(0),
  tags: text("tags").array(),
  isRecommendedForSymptoms: text("is_recommended_for_symptoms").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDoctorSchema = createInsertSchema(doctors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertEmergencyLogSchema = createInsertSchema(emergencyLogs).omit({
  id: true,
  createdAt: true,
  resolvedAt: true,
});

export const insertDiseasePredictionSchema = createInsertSchema(diseasesPredictions).omit({
  id: true,
  createdAt: true,
});

export const insertBloodDonationRequestSchema = createInsertSchema(bloodDonationRequests).omit({
  id: true,
  createdAt: true,
  fulfilledAt: true,
});

export const insertBloodDonationResponseSchema = createInsertSchema(bloodDonationResponses).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertOrganDonationMatchSchema = createInsertSchema(organDonationMatches).omit({
  id: true,
  createdAt: true,
  transplantedAt: true,
});

export const insertHealthProductSchema = createInsertSchema(healthProducts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type Doctor = typeof doctors.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

export type InsertEmergencyLog = z.infer<typeof insertEmergencyLogSchema>;
export type EmergencyLog = typeof emergencyLogs.$inferSelect;

export type InsertDiseasePrediction = z.infer<typeof insertDiseasePredictionSchema>;
export type DiseasePrediction = typeof diseasesPredictions.$inferSelect;

export type InsertBloodDonationRequest = z.infer<typeof insertBloodDonationRequestSchema>;
export type BloodDonationRequest = typeof bloodDonationRequests.$inferSelect;

export type InsertBloodDonationResponse = z.infer<typeof insertBloodDonationResponseSchema>;
export type BloodDonationResponse = typeof bloodDonationResponses.$inferSelect;

export type InsertOrganDonationMatch = z.infer<typeof insertOrganDonationMatchSchema>;
export type OrganDonationMatch = typeof organDonationMatches.$inferSelect;

export type InsertHealthProduct = z.infer<typeof insertHealthProductSchema>;
export type HealthProduct = typeof healthProducts.$inferSelect;

// Dashboard stats type
export type DashboardStats = {
  activeChatCount: number;
  emergencyCount: number;
  availableDoctorCount: number;
  bloodDonorCount: number;
};
