import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { analyzeSymptoms, generateChatResponse, recommendHealthProducts } from "./services/openai";
import {
  insertChatMessageSchema,
  insertEmergencyLogSchema,
  insertDiseasePredictionSchema,
  insertBloodDonationRequestSchema,
  insertBloodDonationResponseSchema,
  insertDoctorSchema,
  insertHealthProductSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Chat endpoints
  app.post('/api/chat/message', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messageData = insertChatMessageSchema.parse({
        ...req.body,
        userId,
      });

      const message = await storage.createChatMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Error creating chat message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get('/api/chat/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { doctorId } = req.query;
      const messages = await storage.getChatMessages(userId, doctorId as string);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // AI analysis endpoint
  app.post('/api/ai/analyze-symptoms', isAuthenticated, async (req: any, res) => {
    try {
      const { symptoms, duration, severity, additionalContext } = req.body;
      const analysis = await analyzeSymptoms(symptoms, duration, severity, additionalContext);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing symptoms:", error);
      res.status(500).json({ message: "Failed to analyze symptoms" });
    }
  });

  app.post('/api/ai/chat', isAuthenticated, async (req: any, res) => {
    try {
      const { message, conversationHistory } = req.body;
      const response = await generateChatResponse(message, conversationHistory || []);
      res.json(response);
    } catch (error) {
      console.error("Error generating AI chat response:", error);
      res.status(500).json({ message: "Failed to generate response" });
    }
  });

  // Emergency endpoints
  app.post('/api/emergency', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const emergencyData = insertEmergencyLogSchema.parse({
        ...req.body,
        userId,
      });

      const emergency = await storage.createEmergencyLog(emergencyData);
      res.json(emergency);
    } catch (error) {
      console.error("Error creating emergency log:", error);
      res.status(500).json({ message: "Failed to log emergency" });
    }
  });

  app.get('/api/emergency', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const emergencies = await storage.getEmergencyLogs(userId);
      res.json(emergencies);
    } catch (error) {
      console.error("Error fetching emergency logs:", error);
      res.status(500).json({ message: "Failed to fetch emergencies" });
    }
  });

  app.get('/api/emergency/active', isAuthenticated, async (req, res) => {
    try {
      const emergencies = await storage.getActiveEmergencies();
      res.json(emergencies);
    } catch (error) {
      console.error("Error fetching active emergencies:", error);
      res.status(500).json({ message: "Failed to fetch active emergencies" });
    }
  });

  app.put('/api/emergency/:id/resolve', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { assignedDoctorId } = req.body;
      const emergency = await storage.updateEmergencyStatus(id, true, assignedDoctorId);
      res.json(emergency);
    } catch (error) {
      console.error("Error resolving emergency:", error);
      res.status(500).json({ message: "Failed to resolve emergency" });
    }
  });

  // Disease prediction endpoints
  app.post('/api/prediction', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { symptoms, duration, severity } = req.body;
      
      // Get AI analysis
      const analysis = await analyzeSymptoms(symptoms, duration, severity);
      
      const predictionData = insertDiseasePredictionSchema.parse({
        userId,
        symptoms,
        duration,
        severity,
        predictions: analysis.predictions,
        aiAnalysis: analysis.recommendations,
      });

      const prediction = await storage.createDiseasePrediction(predictionData);
      res.json({ ...prediction, analysis });
    } catch (error) {
      console.error("Error creating disease prediction:", error);
      res.status(500).json({ message: "Failed to predict disease" });
    }
  });

  app.get('/api/prediction', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const predictions = await storage.getDiseasePredictions(userId);
      res.json(predictions);
    } catch (error) {
      console.error("Error fetching disease predictions:", error);
      res.status(500).json({ message: "Failed to fetch predictions" });
    }
  });

  // Doctor endpoints
  app.post('/api/doctors', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const doctorData = insertDoctorSchema.parse({
        ...req.body,
        userId,
      });

      const doctor = await storage.createDoctor(doctorData);
      res.json(doctor);
    } catch (error) {
      console.error("Error creating doctor profile:", error);
      res.status(500).json({ message: "Failed to create doctor profile" });
    }
  });

  app.get('/api/doctors', async (req, res) => {
    try {
      const doctors = await storage.getAvailableDoctors();
      res.json(doctors);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      res.status(500).json({ message: "Failed to fetch doctors" });
    }
  });

  app.put('/api/doctors/:id/availability', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { isAvailable } = req.body;
      const doctor = await storage.updateDoctorAvailability(id, isAvailable);
      res.json(doctor);
    } catch (error) {
      console.error("Error updating doctor availability:", error);
      res.status(500).json({ message: "Failed to update availability" });
    }
  });

  // Blood donation endpoints
  app.post('/api/blood-donation/request', isAuthenticated, async (req: any, res) => {
    try {
      const requesterId = req.user.claims.sub;
      const requestData = insertBloodDonationRequestSchema.parse({
        ...req.body,
        requesterId,
      });

      const request = await storage.createBloodDonationRequest(requestData);
      res.json(request);
    } catch (error) {
      console.error("Error creating blood donation request:", error);
      res.status(500).json({ message: "Failed to create donation request" });
    }
  });

  app.get('/api/blood-donation/requests', async (req, res) => {
    try {
      const { bloodType } = req.query;
      const requests = bloodType 
        ? await storage.getBloodDonationRequestsByType(bloodType as string)
        : await storage.getBloodDonationRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching blood donation requests:", error);
      res.status(500).json({ message: "Failed to fetch donation requests" });
    }
  });

  app.post('/api/blood-donation/respond', isAuthenticated, async (req: any, res) => {
    try {
      const donorId = req.user.claims.sub;
      const responseData = insertBloodDonationResponseSchema.parse({
        ...req.body,
        donorId,
      });

      const response = await storage.respondToBloodDonationRequest(responseData);
      res.json(response);
    } catch (error) {
      console.error("Error responding to blood donation request:", error);
      res.status(500).json({ message: "Failed to respond to donation request" });
    }
  });

  app.get('/api/blood-donation/responses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { requestId } = req.query;
      const responses = await storage.getBloodDonationResponses(
        requestId as string,
        userId
      );
      res.json(responses);
    } catch (error) {
      console.error("Error fetching blood donation responses:", error);
      res.status(500).json({ message: "Failed to fetch donation responses" });
    }
  });

  // Organ donation endpoints
  app.get('/api/organ-donation/matches', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { type } = req.query; // 'donor' or 'recipient'
      
      const matches = type === 'donor' 
        ? await storage.getOrganDonationMatches(userId)
        : await storage.getOrganDonationMatches(undefined, userId);
      
      res.json(matches);
    } catch (error) {
      console.error("Error fetching organ donation matches:", error);
      res.status(500).json({ message: "Failed to fetch organ matches" });
    }
  });

  // Health products endpoints
  app.post('/api/products', isAuthenticated, async (req, res) => {
    try {
      const productData = insertHealthProductSchema.parse(req.body);
      const product = await storage.createHealthProduct(productData);
      res.json(product);
    } catch (error) {
      console.error("Error creating health product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.get('/api/products', async (req, res) => {
    try {
      const { category } = req.query;
      const products = await storage.getHealthProducts(category as string);
      res.json(products);
    } catch (error) {
      console.error("Error fetching health products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/products/recommended', isAuthenticated, async (req, res) => {
    try {
      const { symptoms } = req.query;
      const symptomArray = typeof symptoms === 'string' ? symptoms.split(',') : [];
      const products = await storage.getRecommendedProducts(symptomArray);
      res.json(products);
    } catch (error) {
      console.error("Error fetching recommended products:", error);
      res.status(500).json({ message: "Failed to fetch recommended products" });
    }
  });

  // User profile updates
  app.put('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userData = {
        id: userId,
        ...req.body,
        updatedAt: new Date(),
      };
      
      const user = await storage.upsertUser(userData);
      res.json(user);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket, req) => {
    console.log('New WebSocket connection');

    ws.on('message', async (message: Buffer) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'chat_message') {
          // Store the message
          const chatMessage = await storage.createChatMessage({
            userId: data.userId,
            doctorId: data.doctorId,
            message: data.message,
            isFromAI: false,
            isFromDoctor: false,
          });

          // Broadcast to all connected clients (in a real app, you'd filter by user/room)
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'chat_message',
                data: chatMessage,
              }));
            }
          });

          // If it's not a doctor conversation, generate AI response
          if (!data.doctorId) {
            const aiResponse = await generateChatResponse(data.message, data.conversationHistory || []);
            
            const aiMessage = await storage.createChatMessage({
              userId: data.userId,
              message: aiResponse.message,
              isFromAI: true,
              metadata: aiResponse.analysis,
            });

            // Broadcast AI response
            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'ai_response',
                  data: aiMessage,
                  analysis: aiResponse.analysis,
                  followupQuestions: aiResponse.followupQuestions,
                }));
              }
            });
          }
        } else if (data.type === 'emergency') {
          // Handle emergency alerts
          const emergency = await storage.createEmergencyLog(data.emergencyData);
          
          // Broadcast emergency to all connected clients (doctors, admins)
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'emergency_alert',
                data: emergency,
              }));
            }
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Failed to process message',
        }));
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  return httpServer;
}
