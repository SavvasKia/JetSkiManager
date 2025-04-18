import express, { Request, Response } from "express";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertJetSkiSchema, insertBookingSchema, insertMaintenanceSchema,
  JetSkiStatus, BookingStatus
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = express.Router();
  
  // JetSki routes
  apiRouter.get("/jetskis", async (req: Request, res: Response) => {
    try {
      const jetSkis = await storage.getJetSkis();
      return res.json(jetSkis);
    } catch (error) {
      console.error("Error fetching jet skis:", error);
      return res.status(500).json({ message: "Failed to fetch jet skis" });
    }
  });
  
  apiRouter.get("/jetskis/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const jetSki = await storage.getJetSki(id);
      if (!jetSki) {
        return res.status(404).json({ message: "JetSki not found" });
      }
      
      return res.json(jetSki);
    } catch (error) {
      console.error("Error fetching jet ski:", error);
      return res.status(500).json({ message: "Failed to fetch jet ski" });
    }
  });
  
  apiRouter.post("/jetskis", async (req: Request, res: Response) => {
    try {
      console.log("Received new jet ski data:", req.body);
      
      const validatedData = insertJetSkiSchema.parse({
        name: req.body.name,
        brand: req.body.brand,
        status: req.body.status,
        hoursUsed: req.body.hoursUsed || 0,
        lastMaintenanceDate: req.body.lastMaintenanceDate || null
      });
      
      const jetSki = await storage.createJetSki(validatedData);
      return res.status(201).json(jetSki);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.errors);
        return res.status(400).json({ message: "Invalid jet ski data", errors: error.errors });
      }
      console.error("Error creating jet ski:", error);
      return res.status(500).json({ message: "Failed to create jet ski" });
    }
  });
  
  apiRouter.patch("/jetskis/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      // Allow partial updates
      const validatedData = insertJetSkiSchema.partial().parse(req.body);
      const updatedJetSki = await storage.updateJetSki(id, validatedData);
      
      if (!updatedJetSki) {
        return res.status(404).json({ message: "JetSki not found" });
      }
      
      return res.json(updatedJetSki);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid jet ski data", errors: error.errors });
      }
      console.error("Error updating jet ski:", error);
      return res.status(500).json({ message: "Failed to update jet ski" });
    }
  });
  
  apiRouter.delete("/jetskis/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const success = await storage.deleteJetSki(id);
      if (!success) {
        return res.status(404).json({ message: "JetSki not found" });
      }
      
      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting jet ski:", error);
      return res.status(500).json({ message: "Failed to delete jet ski" });
    }
  });
  
  // Booking routes
  apiRouter.get("/bookings", async (req: Request, res: Response) => {
    try {
      const bookings = await storage.getBookings();
      return res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      return res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });
  
  apiRouter.get("/bookings/today", async (req: Request, res: Response) => {
    try {
      const bookings = await storage.getTodayBookings();
      return res.json(bookings);
    } catch (error) {
      console.error("Error fetching today's bookings:", error);
      return res.status(500).json({ message: "Failed to fetch today's bookings" });
    }
  });
  
  apiRouter.get("/bookings/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const booking = await storage.getBooking(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      return res.json(booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      return res.status(500).json({ message: "Failed to fetch booking" });
    }
  });
  
  apiRouter.post("/bookings", async (req: Request, res: Response) => {
    try {
      const validatedData = insertBookingSchema.parse({
        ...req.body,
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime)
      });
      
      // Verify jetski exists
      const jetSki = await storage.getJetSki(validatedData.jetSkiId);
      if (!jetSki) {
        return res.status(400).json({ message: "Selected JetSki does not exist" });
      }
      
      // Check jetski availability
      const availableJetSkis = await storage.getAvailableJetSkis(
        validatedData.startTime,
        validatedData.endTime
      );
      
      const isAvailable = availableJetSkis.some(js => js.id === validatedData.jetSkiId);
      if (!isAvailable) {
        return res.status(400).json({ message: "Selected JetSki is not available for the requested time slot" });
      }
      
      const booking = await storage.createBooking(validatedData);
      return res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      }
      console.error("Error creating booking:", error);
      return res.status(500).json({ message: "Failed to create booking" });
    }
  });
  
  apiRouter.patch("/bookings/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      // Get the current booking
      const existingBooking = await storage.getBooking(id);
      if (!existingBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Convert dates in the request body
      const requestData = { ...req.body };
      if (requestData.startTime) {
        requestData.startTime = new Date(requestData.startTime);
      }
      if (requestData.endTime) {
        requestData.endTime = new Date(requestData.endTime);
      }
      
      // Allow partial updates
      const validatedData = insertBookingSchema.partial().parse(requestData);
      
      // If changing dates or jetski, verify availability
      if ((validatedData.startTime || validatedData.endTime || validatedData.jetSkiId) &&
          validatedData.status !== BookingStatus.CANCELLED) {
        
        const startTime = validatedData.startTime || existingBooking.startTime;
        const endTime = validatedData.endTime || existingBooking.endTime;
        const jetSkiId = validatedData.jetSkiId || existingBooking.jetSkiId;
        
        // Check jetski availability (excluding this booking)
        const bookings = await storage.getBookings();
        const otherBookings = bookings.filter(b => b.id !== id);
        
        const hasConflict = otherBookings.some(booking => 
          booking.jetSkiId === jetSkiId && 
          booking.status !== BookingStatus.CANCELLED &&
          ((booking.startTime <= startTime && booking.endTime > startTime) || 
           (booking.startTime < endTime && booking.endTime >= endTime) ||
           (booking.startTime >= startTime && booking.endTime <= endTime))
        );
        
        if (hasConflict) {
          return res.status(400).json({ message: "Selected JetSki is not available for the requested time slot" });
        }
      }
      
      const updatedBooking = await storage.updateBooking(id, validatedData);
      
      return res.json(updatedBooking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      }
      console.error("Error updating booking:", error);
      return res.status(500).json({ message: "Failed to update booking" });
    }
  });
  
  apiRouter.delete("/bookings/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const success = await storage.deleteBooking(id);
      if (!success) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting booking:", error);
      return res.status(500).json({ message: "Failed to delete booking" });
    }
  });
  
  // Maintenance routes
  apiRouter.get("/maintenance", async (req: Request, res: Response) => {
    try {
      const maintenanceSchedules = await storage.getMaintenanceSchedules();
      return res.json(maintenanceSchedules);
    } catch (error) {
      console.error("Error fetching maintenance schedules:", error);
      return res.status(500).json({ message: "Failed to fetch maintenance schedules" });
    }
  });
  
  apiRouter.get("/maintenance/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const maintenance = await storage.getMaintenanceSchedule(id);
      if (!maintenance) {
        return res.status(404).json({ message: "Maintenance schedule not found" });
      }
      
      return res.json(maintenance);
    } catch (error) {
      console.error("Error fetching maintenance schedule:", error);
      return res.status(500).json({ message: "Failed to fetch maintenance schedule" });
    }
  });
  
  apiRouter.post("/maintenance", async (req: Request, res: Response) => {
    try {
      const validatedData = insertMaintenanceSchema.parse({
        ...req.body,
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime)
      });
      
      // Verify jetski exists
      const jetSki = await storage.getJetSki(validatedData.jetSkiId);
      if (!jetSki) {
        return res.status(400).json({ message: "Selected JetSki does not exist" });
      }
      
      const maintenance = await storage.createMaintenanceSchedule(validatedData);
      
      // If maintenance is being scheduled, update the jetski status if it's currently available
      if (!validatedData.completed) {
        const now = new Date();
        if (validatedData.startTime <= now && validatedData.endTime > now && jetSki.status === JetSkiStatus.AVAILABLE) {
          let status = JetSkiStatus.MAINTENANCE;
          
          if (validatedData.type === "refueling") {
            status = JetSkiStatus.REFUELING;
          } else if (validatedData.type === "repairs") {
            status = JetSkiStatus.MAINTENANCE;
          }
          
          await storage.updateJetSki(jetSki.id, { status });
        }
      }
      
      return res.status(201).json(maintenance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid maintenance data", errors: error.errors });
      }
      console.error("Error creating maintenance schedule:", error);
      return res.status(500).json({ message: "Failed to create maintenance schedule" });
    }
  });
  
  apiRouter.patch("/maintenance/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      // Get the current maintenance schedule
      const existingMaintenance = await storage.getMaintenanceSchedule(id);
      if (!existingMaintenance) {
        return res.status(404).json({ message: "Maintenance schedule not found" });
      }
      
      // Convert dates in the request body
      const requestData = { ...req.body };
      if (requestData.startTime) {
        requestData.startTime = new Date(requestData.startTime);
      }
      if (requestData.endTime) {
        requestData.endTime = new Date(requestData.endTime);
      }
      
      // Allow partial updates
      const validatedData = insertMaintenanceSchema.partial().parse(requestData);
      
      const updatedMaintenance = await storage.updateMaintenanceSchedule(id, validatedData);
      
      // If maintenance is completed, update the jetski status back to available
      if (validatedData.completed === true) {
        const jetSki = await storage.getJetSki(existingMaintenance.jetSkiId);
        if (jetSki) {
          if (jetSki.status === JetSkiStatus.MAINTENANCE || jetSki.status === JetSkiStatus.REFUELING) {
            await storage.updateJetSki(jetSki.id, { status: JetSkiStatus.AVAILABLE });
          }
        }
      }
      
      return res.json(updatedMaintenance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid maintenance data", errors: error.errors });
      }
      console.error("Error updating maintenance schedule:", error);
      return res.status(500).json({ message: "Failed to update maintenance schedule" });
    }
  });
  
  apiRouter.delete("/maintenance/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const success = await storage.deleteMaintenanceSchedule(id);
      if (!success) {
        return res.status(404).json({ message: "Maintenance schedule not found" });
      }
      
      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting maintenance schedule:", error);
      return res.status(500).json({ message: "Failed to delete maintenance schedule" });
    }
  });
  
  // Specialized routes
  apiRouter.get("/dashboard", async (req: Request, res: Response) => {
    try {
      const [
        allJetSkis,
        todayBookings,
        maintenanceCount,
        refuelingCount
      ] = await Promise.all([
        storage.getJetSkis(),
        storage.getTodayBookings(),
        storage.getPendingMaintenanceCount(),
        storage.getRefuelingNeededCount()
      ]);
      
      const availableJetSkis = allJetSkis.filter(jetSki => jetSki.status === JetSkiStatus.AVAILABLE);
      
      return res.json({
        totalJetSkis: allJetSkis.length,
        availableJetSkis: availableJetSkis.length,
        todayBookings: todayBookings.length,
        maintenanceAlerts: maintenanceCount,
        refuelingNeeded: refuelingCount
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      return res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });
  
  apiRouter.get("/hardliner/availability", async (req: Request, res: Response) => {
    try {
      const availability = await storage.getHardlinerAvailability();
      return res.json(availability);
    } catch (error) {
      console.error("Error fetching hardliner availability:", error);
      return res.status(500).json({ message: "Failed to fetch hardliner availability" });
    }
  });
  
  // Use api prefix for all routes
  app.use("/api", apiRouter);
  
  // Create and return server
  const httpServer = createServer(app);
  return httpServer;
}
