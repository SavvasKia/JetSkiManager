import { 
  users, type User, type InsertUser,
  jetSkis, type JetSki, type InsertJetSki,
  bookings, type Booking, type InsertBooking,
  maintenanceSchedule, type Maintenance, type InsertMaintenance,
  JetSkiStatus, BookingStatus, MaintenanceType
} from "@shared/schema";
import { db } from "./db";
import { eq, ne, and, or, lt, gt, lte, gte, inArray, notInArray, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (kept for compatibility)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // JetSki operations
  getJetSkis(): Promise<JetSki[]>;
  getJetSki(id: number): Promise<JetSki | undefined>;
  createJetSki(jetSki: InsertJetSki): Promise<JetSki>;
  updateJetSki(id: number, jetSki: Partial<InsertJetSki>): Promise<JetSki | undefined>;
  deleteJetSki(id: number): Promise<boolean>;
  
  // Booking operations
  getBookings(): Promise<Booking[]>;
  getBooking(id: number): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking | undefined>;
  deleteBooking(id: number): Promise<boolean>;
  getTodayBookings(): Promise<Booking[]>;
  
  // Maintenance operations
  getMaintenanceSchedules(): Promise<Maintenance[]>;
  getMaintenanceSchedule(id: number): Promise<Maintenance | undefined>;
  createMaintenanceSchedule(maintenance: InsertMaintenance): Promise<Maintenance>;
  updateMaintenanceSchedule(id: number, maintenance: Partial<InsertMaintenance>): Promise<Maintenance | undefined>;
  deleteMaintenanceSchedule(id: number): Promise<boolean>;
  
  // Specialized queries
  getHardlinerJetSkis(): Promise<JetSki[]>;
  getAvailableJetSkis(startTime: Date, endTime: Date): Promise<JetSki[]>;
  getHardlinerAvailability(): Promise<{count: number, from: Date, until: Date, jetSkis: JetSki[]}[]>;
  getJetSkiCurrentBooking(jetSkiId: number): Promise<Booking | undefined>;
  getPendingMaintenanceCount(): Promise<number>;
  getRefuelingNeededCount(): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private jetSkisData: Map<number, JetSki>;
  private bookingsData: Map<number, Booking>;
  private maintenanceData: Map<number, Maintenance>;
  private currentUserId: number;
  private currentJetSkiId: number;
  private currentBookingId: number;
  private currentMaintenanceId: number;

  constructor() {
    this.users = new Map();
    this.jetSkisData = new Map();
    this.bookingsData = new Map();
    this.maintenanceData = new Map();
    this.currentUserId = 1;
    this.currentJetSkiId = 1;
    this.currentBookingId = 1;
    this.currentMaintenanceId = 1;
    
    // Pre-populate with some test data
    this.initializeData();
  }

  private initializeData() {
    // Create some initial jetskis
    const jetski1 = this.createJetSki({
      name: "Wave Runner 1",
      brand: "Hardliner",
      status: JetSkiStatus.AVAILABLE,
      lastMaintenanceDate: new Date(2023, 4, 30),
      hoursUsed: 128
    });

    const jetski2 = this.createJetSki({
      name: "Wave Runner 2",
      brand: "Hardliner",
      status: JetSkiStatus.IN_USE,
      lastMaintenanceDate: new Date(2023, 5, 5),
      hoursUsed: 142
    });

    const jetski3 = this.createJetSki({
      name: "Sea Glider",
      brand: "WaveMotion",
      status: JetSkiStatus.REFUELING,
      lastMaintenanceDate: new Date(2023, 5, 10),
      hoursUsed: 95
    });

    const jetski4 = this.createJetSki({
      name: "Sea Drifter",
      brand: "Hardliner",
      status: JetSkiStatus.MAINTENANCE,
      lastMaintenanceDate: new Date(2023, 3, 15),
      hoursUsed: 215
    });

    const jetski5 = this.createJetSki({
      name: "Wave Cruiser",
      brand: "Hardliner",
      status: JetSkiStatus.IN_USE,
      lastMaintenanceDate: new Date(2023, 5, 1),
      hoursUsed: 155
    });
    
    // Create some initial bookings
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    this.createBooking({
      customerName: "John Smith",
      customerEmail: "john@example.com",
      customerPhone: "555-123-4567",
      jetSkiId: jetski2.id,
      startTime: new Date(today.getTime() + 13 * 60 * 60 * 1000), // 1:00 PM
      endTime: new Date(today.getTime() + 14.5 * 60 * 60 * 1000), // 2:30 PM
      status: BookingStatus.IN_PROGRESS,
      notes: "First time rider"
    });
    
    this.createBooking({
      customerName: "Emma Johnson",
      customerEmail: "emma@example.com",
      customerPhone: "555-789-0123",
      jetSkiId: jetski1.id,
      startTime: new Date(today.getTime() + 15 * 60 * 60 * 1000), // 3:00 PM
      endTime: new Date(today.getTime() + 16.5 * 60 * 60 * 1000), // 4:30 PM
      status: BookingStatus.SCHEDULED,
      notes: ""
    });
    
    this.createBooking({
      customerName: "Michael Brown",
      customerEmail: "michael@example.com",
      customerPhone: "555-456-7890",
      jetSkiId: jetski3.id,
      startTime: new Date(today.getTime() + 11 * 60 * 60 * 1000), // 11:00 AM
      endTime: new Date(today.getTime() + 12.5 * 60 * 60 * 1000), // 12:30 PM
      status: BookingStatus.COMPLETED,
      notes: "Returning customer"
    });

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    this.createBooking({
      customerName: "Sarah Wilson",
      customerEmail: "sarah@example.com",
      customerPhone: "555-234-5678",
      jetSkiId: jetski1.id,
      startTime: new Date(tomorrow.getTime() + 10 * 60 * 60 * 1000), // 10:00 AM
      endTime: new Date(tomorrow.getTime() + 11.5 * 60 * 60 * 1000), // 11:30 AM
      status: BookingStatus.SCHEDULED,
      notes: ""
    });
    
    this.createBooking({
      customerName: "David Miller",
      customerEmail: "david@example.com",
      customerPhone: "555-345-6789",
      jetSkiId: jetski5.id,
      startTime: new Date(today.getTime() + 12.5 * 60 * 60 * 1000), // 12:30 PM
      endTime: new Date(today.getTime() + 16.5 * 60 * 60 * 1000), // 4:30 PM
      status: BookingStatus.IN_PROGRESS,
      notes: "Extended booking"
    });
    
    // Create some maintenance schedules
    this.createMaintenanceSchedule({
      jetSkiId: jetski4.id,
      type: "maintenance",
      startTime: new Date(today.getTime() + 8 * 60 * 60 * 1000), // 8:00 AM
      endTime: new Date(today.getTime() + 12 * 60 * 60 * 1000), // 12:00 PM
      completed: false,
      notes: "Regular service check"
    });
    
    this.createMaintenanceSchedule({
      jetSkiId: jetski3.id,
      type: "refueling",
      startTime: new Date(today.getTime() + 12.5 * 60 * 60 * 1000), // 12:30 PM
      endTime: new Date(today.getTime() + 13 * 60 * 60 * 1000), // 1:00 PM
      completed: false,
      notes: ""
    });
    
    this.createMaintenanceSchedule({
      jetSkiId: jetski1.id,
      type: "maintenance",
      startTime: new Date(tomorrow.getTime() + 8 * 60 * 60 * 1000), // 8:00 AM
      endTime: new Date(tomorrow.getTime() + 11 * 60 * 60 * 1000), // 11:00 AM
      completed: false,
      notes: "Oil change"
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // JetSki operations
  async getJetSkis(): Promise<JetSki[]> {
    return Array.from(this.jetSkisData.values());
  }

  async getJetSki(id: number): Promise<JetSki | undefined> {
    return this.jetSkisData.get(id);
  }

  async createJetSki(jetSki: InsertJetSki): Promise<JetSki> {
    const id = this.currentJetSkiId++;
    const newJetSki: JetSki = { ...jetSki, id };
    this.jetSkisData.set(id, newJetSki);
    return newJetSki;
  }

  async updateJetSki(id: number, jetSki: Partial<InsertJetSki>): Promise<JetSki | undefined> {
    const existingJetSki = this.jetSkisData.get(id);
    if (!existingJetSki) return undefined;
    
    const updatedJetSki = { ...existingJetSki, ...jetSki };
    this.jetSkisData.set(id, updatedJetSki);
    return updatedJetSki;
  }

  async deleteJetSki(id: number): Promise<boolean> {
    return this.jetSkisData.delete(id);
  }

  // Booking operations
  async getBookings(): Promise<Booking[]> {
    return Array.from(this.bookingsData.values());
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookingsData.get(id);
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const newBooking: Booking = { ...booking, id };
    this.bookingsData.set(id, newBooking);
    return newBooking;
  }

  async updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking | undefined> {
    const existingBooking = this.bookingsData.get(id);
    if (!existingBooking) return undefined;
    
    const updatedBooking = { ...existingBooking, ...booking };
    this.bookingsData.set(id, updatedBooking);
    return updatedBooking;
  }

  async deleteBooking(id: number): Promise<boolean> {
    return this.bookingsData.delete(id);
  }

  async getTodayBookings(): Promise<Booking[]> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return Array.from(this.bookingsData.values()).filter(booking => 
      booking.startTime >= today && booking.startTime < tomorrow
    );
  }

  // Maintenance operations
  async getMaintenanceSchedules(): Promise<Maintenance[]> {
    return Array.from(this.maintenanceData.values());
  }

  async getMaintenanceSchedule(id: number): Promise<Maintenance | undefined> {
    return this.maintenanceData.get(id);
  }

  async createMaintenanceSchedule(maintenance: InsertMaintenance): Promise<Maintenance> {
    const id = this.currentMaintenanceId++;
    const newMaintenance: Maintenance = { ...maintenance, id };
    this.maintenanceData.set(id, newMaintenance);
    return newMaintenance;
  }

  async updateMaintenanceSchedule(id: number, maintenance: Partial<InsertMaintenance>): Promise<Maintenance | undefined> {
    const existingMaintenance = this.maintenanceData.get(id);
    if (!existingMaintenance) return undefined;
    
    const updatedMaintenance = { ...existingMaintenance, ...maintenance };
    this.maintenanceData.set(id, updatedMaintenance);
    return updatedMaintenance;
  }

  async deleteMaintenanceSchedule(id: number): Promise<boolean> {
    return this.maintenanceData.delete(id);
  }

  // Specialized queries
  async getHardlinerJetSkis(): Promise<JetSki[]> {
    return Array.from(this.jetSkisData.values()).filter(jetSki => 
      jetSki.brand.toLowerCase() === "hardliner"
    );
  }

  async getAvailableJetSkis(startTime: Date, endTime: Date): Promise<JetSki[]> {
    const jetSkis = Array.from(this.jetSkisData.values());
    const bookings = Array.from(this.bookingsData.values());
    const maintenances = Array.from(this.maintenanceData.values());
    
    return jetSkis.filter(jetSki => {
      // Check if jetski is available
      if (jetSki.status !== JetSkiStatus.AVAILABLE) return false;
      
      // Check if there's an overlapping booking
      const hasBookingConflict = bookings.some(booking => 
        booking.jetSkiId === jetSki.id && 
        booking.status !== BookingStatus.CANCELLED &&
        ((booking.startTime <= startTime && booking.endTime > startTime) || 
         (booking.startTime < endTime && booking.endTime >= endTime) ||
         (booking.startTime >= startTime && booking.endTime <= endTime))
      );
      
      // Check if there's an overlapping maintenance
      const hasMaintenanceConflict = maintenances.some(maintenance => 
        maintenance.jetSkiId === jetSki.id && 
        !maintenance.completed &&
        ((maintenance.startTime <= startTime && maintenance.endTime > startTime) || 
         (maintenance.startTime < endTime && maintenance.endTime >= endTime) ||
         (maintenance.startTime >= startTime && maintenance.endTime <= endTime))
      );
      
      return !hasBookingConflict && !hasMaintenanceConflict;
    });
  }

  async getHardlinerAvailability(): Promise<{ count: number; from: Date; until: Date; jetSkis: JetSki[] }[]> {
    const hardliners = await this.getHardlinerJetSkis();
    const bookings = Array.from(this.bookingsData.values());
    const maintenances = Array.from(this.maintenanceData.values());
    
    // Get all time points where availability changes
    const timePoints = new Set<number>();
    const now = new Date();
    timePoints.add(now.getTime()); // Add current time
    
    // Add start and end times from bookings and maintenances
    bookings.forEach(booking => {
      if (booking.status !== BookingStatus.CANCELLED) {
        timePoints.add(booking.startTime.getTime());
        timePoints.add(booking.endTime.getTime());
      }
    });
    
    maintenances.forEach(maintenance => {
      if (!maintenance.completed) {
        timePoints.add(maintenance.startTime.getTime());
        timePoints.add(maintenance.endTime.getTime());
      }
    });
    
    // Sort time points
    const sortedTimePoints = Array.from(timePoints).sort((a, b) => a - b);
    
    // For each time interval, check how many hardliners are available
    const result: { count: number; from: Date; until: Date; jetSkis: JetSki[] }[] = [];
    
    for (let i = 0; i < sortedTimePoints.length - 1; i++) {
      const fromTime = new Date(sortedTimePoints[i]);
      const untilTime = new Date(sortedTimePoints[i + 1]);
      
      if (fromTime >= untilTime) continue;
      
      const availableJetSkis = hardliners.filter(jetSki => {
        // Check if jetski is available at this time
        if (jetSki.status !== JetSkiStatus.AVAILABLE) return false;
        
        // Check for booking conflicts
        const hasBookingConflict = bookings.some(booking => 
          booking.jetSkiId === jetSki.id && 
          booking.status !== BookingStatus.CANCELLED &&
          booking.startTime <= fromTime && booking.endTime > fromTime
        );
        
        // Check for maintenance conflicts
        const hasMaintenanceConflict = maintenances.some(maintenance => 
          maintenance.jetSkiId === jetSki.id && 
          !maintenance.completed &&
          maintenance.startTime <= fromTime && maintenance.endTime > fromTime
        );
        
        return !hasBookingConflict && !hasMaintenanceConflict;
      });
      
      if (availableJetSkis.length > 0) {
        result.push({
          count: availableJetSkis.length,
          from: fromTime,
          until: untilTime,
          jetSkis: availableJetSkis
        });
      }
    }
    
    // Group consecutive intervals with the same available jetskis
    const groupedResult: { count: number; from: Date; until: Date; jetSkis: JetSki[] }[] = [];
    
    for (const interval of result) {
      const lastInterval = groupedResult[groupedResult.length - 1];
      
      if (lastInterval && 
          lastInterval.count === interval.count && 
          lastInterval.until.getTime() === interval.from.getTime() &&
          JSON.stringify(lastInterval.jetSkis.map(j => j.id).sort()) === 
          JSON.stringify(interval.jetSkis.map(j => j.id).sort())) {
        // Extend the last interval
        lastInterval.until = interval.until;
      } else {
        // Add a new interval
        groupedResult.push({ ...interval });
      }
    }
    
    return groupedResult;
  }

  async getJetSkiCurrentBooking(jetSkiId: number): Promise<Booking | undefined> {
    const now = new Date();
    
    return Array.from(this.bookingsData.values()).find(booking => 
      booking.jetSkiId === jetSkiId &&
      booking.status !== BookingStatus.CANCELLED &&
      booking.startTime <= now && booking.endTime > now
    );
  }

  async getPendingMaintenanceCount(): Promise<number> {
    const maintenances = Array.from(this.maintenanceData.values());
    return maintenances.filter(m => !m.completed && m.type === "maintenance").length;
  }

  async getRefuelingNeededCount(): Promise<number> {
    const maintenances = Array.from(this.maintenanceData.values());
    return maintenances.filter(m => !m.completed && m.type === "refueling").length;
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getJetSkis(): Promise<JetSki[]> {
    return await db.select().from(jetSkis);
  }

  async getJetSki(id: number): Promise<JetSki | undefined> {
    const [jetSki] = await db.select().from(jetSkis).where(eq(jetSkis.id, id));
    return jetSki || undefined;
  }

  async createJetSki(jetSki: InsertJetSki): Promise<JetSki> {
    // Ensure the jetSki status is properly typed as JetSkiStatusType
    const safeJetSki = {
      name: jetSki.name,
      brand: jetSki.brand,
      status: jetSki.status,
      hoursUsed: jetSki.hoursUsed,
      lastMaintenanceDate: jetSki.lastMaintenanceDate
    };
    
    console.log("Creating JetSki with data:", safeJetSki);
    
    const [newJetSki] = await db
      .insert(jetSkis)
      .values(safeJetSki)
      .returning();
    return newJetSki;
  }

  async updateJetSki(id: number, jetSki: Partial<InsertJetSki>): Promise<JetSki | undefined> {
    const [updatedJetSki] = await db
      .update(jetSkis)
      .set(jetSki)
      .where(eq(jetSkis.id, id))
      .returning();
    return updatedJetSki || undefined;
  }

  async deleteJetSki(id: number): Promise<boolean> {
    const result = await db
      .delete(jetSkis)
      .where(eq(jetSkis.id, id));
    return true;
  }

  async getBookings(): Promise<Booking[]> {
    return await db.select().from(bookings);
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking || undefined;
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db
      .insert(bookings)
      .values(booking)
      .returning();
    return newBooking;
  }

  async updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking | undefined> {
    const [updatedBooking] = await db
      .update(bookings)
      .set(booking)
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking || undefined;
  }

  async deleteBooking(id: number): Promise<boolean> {
    await db
      .delete(bookings)
      .where(eq(bookings.id, id));
    return true;
  }

  async getTodayBookings(): Promise<Booking[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await db
      .select()
      .from(bookings)
      .where(
        and(
          gte(bookings.startTime, today),
          lt(bookings.startTime, tomorrow)
        )
      );
  }

  async getMaintenanceSchedules(): Promise<Maintenance[]> {
    return await db.select().from(maintenanceSchedule);
  }

  async getMaintenanceSchedule(id: number): Promise<Maintenance | undefined> {
    const [maintenance] = await db
      .select()
      .from(maintenanceSchedule)
      .where(eq(maintenanceSchedule.id, id));
    return maintenance || undefined;
  }

  async createMaintenanceSchedule(maintenance: InsertMaintenance): Promise<Maintenance> {
    const [newMaintenance] = await db
      .insert(maintenanceSchedule)
      .values(maintenance)
      .returning();
    return newMaintenance;
  }

  async updateMaintenanceSchedule(id: number, maintenance: Partial<InsertMaintenance>): Promise<Maintenance | undefined> {
    const [updatedMaintenance] = await db
      .update(maintenanceSchedule)
      .set(maintenance)
      .where(eq(maintenanceSchedule.id, id))
      .returning();
    return updatedMaintenance || undefined;
  }

  async deleteMaintenanceSchedule(id: number): Promise<boolean> {
    await db
      .delete(maintenanceSchedule)
      .where(eq(maintenanceSchedule.id, id));
    return true;
  }

  async getHardlinerJetSkis(): Promise<JetSki[]> {
    return await db
      .select()
      .from(jetSkis)
      .where(sql`LOWER(${jetSkis.brand}) = 'hardliner'`);
  }

  async getAvailableJetSkis(startTime: Date, endTime: Date): Promise<JetSki[]> {
    // Find all jetskis that are available (not in maintenance and not booked for this time period)
    const bookedJetSkiIds = await db
      .select({ id: bookings.jetSkiId })
      .from(bookings)
      .where(
        and(
          or(
            and(lte(bookings.startTime, startTime), gt(bookings.endTime, startTime)),
            and(lt(bookings.startTime, endTime), gte(bookings.endTime, endTime)),
            and(gte(bookings.startTime, startTime), lte(bookings.endTime, endTime))
          ),
          ne(bookings.status, BookingStatus.CANCELLED)
        )
      );
      
    const maintenanceJetSkiIds = await db
      .select({ id: maintenanceSchedule.jetSkiId })
      .from(maintenanceSchedule)
      .where(
        and(
          or(
            and(lte(maintenanceSchedule.startTime, startTime), gt(maintenanceSchedule.endTime, startTime)),
            and(lt(maintenanceSchedule.startTime, endTime), gte(maintenanceSchedule.endTime, endTime)),
            and(gte(maintenanceSchedule.startTime, startTime), lte(maintenanceSchedule.endTime, endTime))
          ),
          eq(maintenanceSchedule.completed, false)
        )
      );
      
    const unavailableIds = [...bookedJetSkiIds, ...maintenanceJetSkiIds].map(item => item.id);
    
    // If no jetskis are unavailable, return all available ones
    if (unavailableIds.length === 0) {
      return await db
        .select()
        .from(jetSkis)
        .where(eq(jetSkis.status, JetSkiStatus.AVAILABLE));
    }
    
    // Otherwise filter out the unavailable ones
    return await db
      .select()
      .from(jetSkis)
      .where(
        and(
          eq(jetSkis.status, JetSkiStatus.AVAILABLE),
          notInArray(jetSkis.id, unavailableIds)
        )
      );
  }

  async getHardlinerAvailability(): Promise<{ count: number; from: Date; until: Date; jetSkis: JetSki[] }[]> {
    // This is a complex query that requires multiple steps
    
    // 1. Get all Hardliner JetSkis
    const hardlinerJetSkis = await this.getHardlinerJetSkis();
    if (hardlinerJetSkis.length === 0) return [];
    
    // 2. Get all bookings and maintenance for these jetskis
    const hardlinerIds = hardlinerJetSkis.map(js => js.id);
    
    const bookingsForHardliners = await db
      .select()
      .from(bookings)
      .where(
        and(
          inArray(bookings.jetSkiId, hardlinerIds),
          ne(bookings.status, BookingStatus.CANCELLED)
        )
      );
      
    const maintenanceForHardliners = await db
      .select()
      .from(maintenanceSchedule)
      .where(
        and(
          inArray(maintenanceSchedule.jetSkiId, hardlinerIds),
          eq(maintenanceSchedule.completed, false)
        )
      );
    
    // 3. Calculate time slots when multiple Hardliners are available
    // For simplicity, we'll consider the next 7 days in 1-hour increments
    const now = new Date();
    const oneWeekLater = new Date(now);
    oneWeekLater.setDate(oneWeekLater.getDate() + 7);
    
    const result: { count: number; from: Date; until: Date; jetSkis: JetSki[] }[] = [];
    
    // Check each hour for the next 7 days
    for (let time = new Date(now); time < oneWeekLater; time.setHours(time.getHours() + 1)) {
      const timeEnd = new Date(time);
      timeEnd.setHours(timeEnd.getHours() + 1);
      
      const availableJetSkis = hardlinerJetSkis.filter(jetSki => {
        // Check if jetski is available
        if (jetSki.status !== JetSkiStatus.AVAILABLE) return false;
        
        // Check if it's not booked during this time
        const booked = bookingsForHardliners.some(booking => 
          (booking.jetSkiId === jetSki.id) && 
          (new Date(booking.startTime) < timeEnd) && 
          (new Date(booking.endTime) > time)
        );
        
        if (booked) return false;
        
        // Check if it's not in maintenance during this time
        const inMaintenance = maintenanceForHardliners.some(maintenance => 
          (maintenance.jetSkiId === jetSki.id) && 
          (new Date(maintenance.startTime) < timeEnd) && 
          (new Date(maintenance.endTime) > time)
        );
        
        return !inMaintenance;
      });
      
      if (availableJetSkis.length > 0) {
        result.push({
          count: availableJetSkis.length,
          from: new Date(time),
          until: new Date(timeEnd),
          jetSkis: availableJetSkis
        });
      }
    }
    
    // Group by consecutive slots with the same available jetskis
    const groupedResult: { count: number; from: Date; until: Date; jetSkis: JetSki[] }[] = [];
    let currentGroup: { count: number; from: Date; until: Date; jetSkis: JetSki[] } | null = null;
    
    for (const slot of result) {
      if (!currentGroup) {
        currentGroup = { ...slot };
        continue;
      }
      
      // Check if this slot has the same jetskis as the current group
      const sameJetSkis = slot.jetSkis.length === currentGroup.jetSkis.length && 
        slot.jetSkis.every(js1 => currentGroup!.jetSkis.some(js2 => js1.id === js2.id));
      
      // And if it's right after the current group's end time
      const consecutive = Math.abs(slot.from.getTime() - currentGroup.until.getTime()) < 1000 * 60 * 5; // 5 min tolerance
      
      if (sameJetSkis && consecutive) {
        // Extend the current group
        currentGroup.until = slot.until;
      } else {
        // Save the current group and start a new one
        groupedResult.push(currentGroup);
        currentGroup = { ...slot };
      }
    }
    
    // Add the last group if it exists
    if (currentGroup) {
      groupedResult.push(currentGroup);
    }
    
    return groupedResult;
  }

  async getJetSkiCurrentBooking(jetSkiId: number): Promise<Booking | undefined> {
    const now = new Date();
    const [currentBooking] = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.jetSkiId, jetSkiId),
          ne(bookings.status, BookingStatus.CANCELLED),
          ne(bookings.status, BookingStatus.COMPLETED),
          lte(bookings.startTime, now),
          gt(bookings.endTime, now)
        )
      );
    
    return currentBooking || undefined;
  }

  async getPendingMaintenanceCount(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(maintenanceSchedule)
      .where(
        and(
          eq(maintenanceSchedule.completed, false),
          eq(maintenanceSchedule.type, MaintenanceType.MAINTENANCE)
        )
      );
    
    return result[0]?.count || 0;
  }

  async getRefuelingNeededCount(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(maintenanceSchedule)
      .where(
        and(
          eq(maintenanceSchedule.completed, false),
          eq(maintenanceSchedule.type, MaintenanceType.REFUELING)
        )
      );
    
    return result[0]?.count || 0;
  }
}

export const storage = new DatabaseStorage();
