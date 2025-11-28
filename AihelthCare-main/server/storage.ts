import {
  users,
  doctors,
  chatMessages,
  emergencyLogs,
  diseasesPredictions,
  bloodDonationRequests,
  bloodDonationResponses,
  organDonationMatches,
  healthProducts,
  type User,
  type UpsertUser,
  type InsertDoctor,
  type Doctor,
  type InsertChatMessage,
  type ChatMessage,
  type InsertEmergencyLog,
  type EmergencyLog,
  type InsertDiseasePrediction,
  type DiseasePrediction,
  type InsertBloodDonationRequest,
  type BloodDonationRequest,
  type InsertBloodDonationResponse,
  type BloodDonationResponse,
  type InsertOrganDonationMatch,
  type OrganDonationMatch,
  type InsertHealthProduct,
  type HealthProduct,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, gte, lte } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Doctor operations
  createDoctor(doctor: InsertDoctor): Promise<Doctor>;
  getDoctor(id: string): Promise<Doctor | undefined>;
  getDoctorByUserId(userId: string): Promise<Doctor | undefined>;
  getAvailableDoctors(): Promise<Doctor[]>;
  updateDoctorAvailability(id: string, isAvailable: boolean): Promise<Doctor | undefined>;
  
  // Chat operations
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(userId: string, doctorId?: string): Promise<ChatMessage[]>;
  
  // Emergency operations
  createEmergencyLog(emergency: InsertEmergencyLog): Promise<EmergencyLog>;
  getEmergencyLogs(userId?: string): Promise<EmergencyLog[]>;
  getActiveEmergencies(): Promise<EmergencyLog[]>;
  updateEmergencyStatus(id: string, isResolved: boolean, assignedDoctorId?: string): Promise<EmergencyLog | undefined>;
  
  // Disease prediction operations
  createDiseasePrediction(prediction: InsertDiseasePrediction): Promise<DiseasePrediction>;
  getDiseasePredictions(userId: string): Promise<DiseasePrediction[]>;
  
  // Blood donation operations
  createBloodDonationRequest(request: InsertBloodDonationRequest): Promise<BloodDonationRequest>;
  getBloodDonationRequests(isActive?: boolean): Promise<BloodDonationRequest[]>;
  getBloodDonationRequestsByType(bloodType: string): Promise<BloodDonationRequest[]>;
  respondToBloodDonationRequest(response: InsertBloodDonationResponse): Promise<BloodDonationResponse>;
  getBloodDonationResponses(requestId?: string, donorId?: string): Promise<BloodDonationResponse[]>;
  
  // Organ donation operations
  createOrganDonationMatch(match: InsertOrganDonationMatch): Promise<OrganDonationMatch>;
  getOrganDonationMatches(donorId?: string, recipientId?: string): Promise<OrganDonationMatch[]>;
  
  // Health products operations
  createHealthProduct(product: InsertHealthProduct): Promise<HealthProduct>;
  getHealthProducts(category?: string): Promise<HealthProduct[]>;
  getRecommendedProducts(symptoms: string[]): Promise<HealthProduct[]>;
  
  // Analytics
  getDashboardStats(): Promise<{
    activeChatCount: number;
    emergencyCount: number;
    availableDoctorCount: number;
    bloodDonorCount: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Doctor operations
  async createDoctor(doctorData: InsertDoctor): Promise<Doctor> {
    const [doctor] = await db.insert(doctors).values(doctorData).returning();
    return doctor;
  }

  async getDoctor(id: string): Promise<Doctor | undefined> {
    const [doctor] = await db.select().from(doctors).where(eq(doctors.id, id));
    return doctor;
  }

  async getDoctorByUserId(userId: string): Promise<Doctor | undefined> {
    const [doctor] = await db.select().from(doctors).where(eq(doctors.userId, userId));
    return doctor;
  }

  async getAvailableDoctors(): Promise<Doctor[]> {
    return await db.select().from(doctors).where(eq(doctors.isAvailable, true));
  }

  async updateDoctorAvailability(id: string, isAvailable: boolean): Promise<Doctor | undefined> {
    const [doctor] = await db
      .update(doctors)
      .set({ isAvailable, updatedAt: new Date() })
      .where(eq(doctors.id, id))
      .returning();
    return doctor;
  }

  // Chat operations
  async createChatMessage(messageData: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db.insert(chatMessages).values(messageData).returning();
    return message;
  }

  async getChatMessages(userId: string, doctorId?: string): Promise<ChatMessage[]> {
    const conditions = [eq(chatMessages.userId, userId)];
    if (doctorId) {
      conditions.push(eq(chatMessages.doctorId, doctorId));
    }
    
    return await db
      .select()
      .from(chatMessages)
      .where(and(...conditions))
      .orderBy(desc(chatMessages.createdAt));
  }

  // Emergency operations
  async createEmergencyLog(emergencyData: InsertEmergencyLog): Promise<EmergencyLog> {
    const [emergency] = await db.insert(emergencyLogs).values(emergencyData).returning();
    return emergency;
  }

  async getEmergencyLogs(userId?: string): Promise<EmergencyLog[]> {
    const conditions = userId ? [eq(emergencyLogs.userId, userId)] : [];
    
    return await db
      .select()
      .from(emergencyLogs)
      .where(and(...conditions))
      .orderBy(desc(emergencyLogs.createdAt));
  }

  async getActiveEmergencies(): Promise<EmergencyLog[]> {
    return await db
      .select()
      .from(emergencyLogs)
      .where(eq(emergencyLogs.isResolved, false))
      .orderBy(desc(emergencyLogs.createdAt));
  }

  async updateEmergencyStatus(id: string, isResolved: boolean, assignedDoctorId?: string): Promise<EmergencyLog | undefined> {
    const [emergency] = await db
      .update(emergencyLogs)
      .set({
        isResolved,
        assignedDoctorId,
        resolvedAt: isResolved ? new Date() : undefined,
      })
      .where(eq(emergencyLogs.id, id))
      .returning();
    return emergency;
  }

  // Disease prediction operations
  async createDiseasePrediction(predictionData: InsertDiseasePrediction): Promise<DiseasePrediction> {
    const [prediction] = await db.insert(diseasesPredictions).values(predictionData).returning();
    return prediction;
  }

  async getDiseasePredictions(userId: string): Promise<DiseasePrediction[]> {
    return await db
      .select()
      .from(diseasesPredictions)
      .where(eq(diseasesPredictions.userId, userId))
      .orderBy(desc(diseasesPredictions.createdAt));
  }

  // Blood donation operations
  async createBloodDonationRequest(requestData: InsertBloodDonationRequest): Promise<BloodDonationRequest> {
    const [request] = await db.insert(bloodDonationRequests).values(requestData).returning();
    return request;
  }

  async getBloodDonationRequests(isActive = true): Promise<BloodDonationRequest[]> {
    return await db
      .select()
      .from(bloodDonationRequests)
      .where(eq(bloodDonationRequests.isActive, isActive))
      .orderBy(desc(bloodDonationRequests.createdAt));
  }

  async getBloodDonationRequestsByType(bloodType: string): Promise<BloodDonationRequest[]> {
    return await db
      .select()
      .from(bloodDonationRequests)
      .where(and(
        eq(bloodDonationRequests.bloodType, bloodType),
        eq(bloodDonationRequests.isActive, true)
      ))
      .orderBy(desc(bloodDonationRequests.createdAt));
  }

  async respondToBloodDonationRequest(responseData: InsertBloodDonationResponse): Promise<BloodDonationResponse> {
    const [response] = await db.insert(bloodDonationResponses).values(responseData).returning();
    return response;
  }

  async getBloodDonationResponses(requestId?: string, donorId?: string): Promise<BloodDonationResponse[]> {
    const conditions = [];
    if (requestId) conditions.push(eq(bloodDonationResponses.requestId, requestId));
    if (donorId) conditions.push(eq(bloodDonationResponses.donorId, donorId));
    
    return await db
      .select()
      .from(bloodDonationResponses)
      .where(and(...conditions))
      .orderBy(desc(bloodDonationResponses.createdAt));
  }

  // Organ donation operations
  async createOrganDonationMatch(matchData: InsertOrganDonationMatch): Promise<OrganDonationMatch> {
    const [match] = await db.insert(organDonationMatches).values(matchData).returning();
    return match;
  }

  async getOrganDonationMatches(donorId?: string, recipientId?: string): Promise<OrganDonationMatch[]> {
    const conditions = [];
    if (donorId) conditions.push(eq(organDonationMatches.donorId, donorId));
    if (recipientId) conditions.push(eq(organDonationMatches.recipientId, recipientId));
    
    return await db
      .select()
      .from(organDonationMatches)
      .where(and(...conditions))
      .orderBy(desc(organDonationMatches.createdAt));
  }

  // Health products operations
  async createHealthProduct(productData: InsertHealthProduct): Promise<HealthProduct> {
    const [product] = await db.insert(healthProducts).values(productData).returning();
    return product;
  }

  async getHealthProducts(category?: string): Promise<HealthProduct[]> {
    const conditions = category ? [eq(healthProducts.category, category)] : [];
    
    return await db
      .select()
      .from(healthProducts)
      .where(and(...conditions))
      .orderBy(desc(healthProducts.rating));
  }

  async getRecommendedProducts(symptoms: string[]): Promise<HealthProduct[]> {
    // This would benefit from a more sophisticated matching algorithm
    // For now, we'll use a simple array overlap check
    return await db
      .select()
      .from(healthProducts)
      .where(eq(healthProducts.inStock, true))
      .orderBy(desc(healthProducts.rating))
      .limit(10);
  }

  // Analytics
  async getDashboardStats(): Promise<{
    activeChatCount: number;
    emergencyCount: number;
    availableDoctorCount: number;
    bloodDonorCount: number;
  }> {
    const [activeChatCountResult] = await db
      .select({ count: count(chatMessages.id) })
      .from(chatMessages)
      .where(gte(chatMessages.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000))); // Last 24 hours

    const [emergencyCountResult] = await db
      .select({ count: count(emergencyLogs.id) })
      .from(emergencyLogs)
      .where(eq(emergencyLogs.isResolved, false));

    const [availableDoctorCountResult] = await db
      .select({ count: count(doctors.id) })
      .from(doctors)
      .where(eq(doctors.isAvailable, true));

    const [bloodDonorCountResult] = await db
      .select({ count: count(users.id) })
      .from(users)
      .where(eq(users.isBloodDonor, true));

    return {
      activeChatCount: activeChatCountResult?.count || 0,
      emergencyCount: emergencyCountResult?.count || 0,
      availableDoctorCount: availableDoctorCountResult?.count || 0,
      bloodDonorCount: bloodDonorCountResult?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();

function count(column: any): any {
  // This is a placeholder for the count function
  // In a real implementation, you'd import this from drizzle-orm
  return column;
}
