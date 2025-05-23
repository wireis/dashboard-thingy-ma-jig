import { services, type Service, type InsertService, type UpdateService } from "@shared/schema";
import { db } from "./db";
import { eq, like, or } from "drizzle-orm";

export interface IStorage {
  // Service CRUD operations
  getServices(): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, updates: UpdateService): Promise<Service | undefined>;
  deleteService(id: number): Promise<boolean>;
  updateServiceStatus(id: number, status: string): Promise<void>;
  
  // Search functionality
  searchServices(query: string): Promise<Service[]>;
  getServicesByCategory(category: string): Promise<Service[]>;
}

export class DatabaseStorage implements IStorage {
  async getServices(): Promise<Service[]> {
    const result = await db.select().from(services).orderBy(services.id);
    return result;
  }

  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service || undefined;
  }

  async createService(insertService: InsertService): Promise<Service> {
    const [service] = await db
      .insert(services)
      .values({
        ...insertService,
        port: insertService.port || null,
        description: insertService.description || null,
        provider: insertService.provider || null,
        location: insertService.location || null,
      })
      .returning();
    return service;
  }

  async updateService(id: number, updates: UpdateService): Promise<Service | undefined> {
    const [service] = await db
      .update(services)
      .set({
        ...updates,
        port: updates.port || null,
        description: updates.description || null,
        provider: updates.provider || null,
        location: updates.location || null,
      })
      .where(eq(services.id, id))
      .returning();
    return service || undefined;
  }

  async deleteService(id: number): Promise<boolean> {
    const result = await db.delete(services).where(eq(services.id, id));
    return result.rowCount > 0;
  }

  async updateServiceStatus(id: number, status: string): Promise<void> {
    await db
      .update(services)
      .set({ 
        status, 
        lastChecked: new Date() 
      })
      .where(eq(services.id, id));
  }

  async searchServices(query: string): Promise<Service[]> {
    const lowercaseQuery = `%${query.toLowerCase()}%`;
    return await db.select().from(services).where(
      or(
        like(services.name, lowercaseQuery),
        like(services.description, lowercaseQuery),
        like(services.provider, lowercaseQuery),
        like(services.category, lowercaseQuery)
      )
    );
  }

  async getServicesByCategory(category: string): Promise<Service[]> {
    if (category === "All") {
      return this.getServices();
    }
    return await db.select().from(services).where(eq(services.category, category));
  }
}

export const storage = new DatabaseStorage();
