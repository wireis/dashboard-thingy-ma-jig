import { services, quickLinks, categories, rssFeeds, type Service, type InsertService, type UpdateService, type QuickLink, type InsertQuickLink, type UpdateQuickLink, type Category, type InsertCategory, type UpdateCategory, type RssFeed, type InsertRssFeed, type UpdateRssFeed } from "@shared/schema";
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

  // Quick Links CRUD operations
  getQuickLinks(): Promise<QuickLink[]>;
  getQuickLink(id: number): Promise<QuickLink | undefined>;
  createQuickLink(quickLink: InsertQuickLink): Promise<QuickLink>;
  updateQuickLink(id: number, updates: UpdateQuickLink): Promise<QuickLink | undefined>;
  deleteQuickLink(id: number): Promise<boolean>;
  getQuickLinksByCategory(category: string): Promise<QuickLink[]>;

  // Category CRUD operations
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, updates: UpdateCategory): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;

  // RSS Feed CRUD operations
  getRssFeeds(): Promise<RssFeed[]>;
  getRssFeed(id: number): Promise<RssFeed | undefined>;
  createRssFeed(rssFeed: InsertRssFeed): Promise<RssFeed>;
  updateRssFeed(id: number, updates: UpdateRssFeed): Promise<RssFeed | undefined>;
  deleteRssFeed(id: number): Promise<boolean>;
  getActiveRssFeeds(): Promise<RssFeed[]>;
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
        icon: insertService.icon || null,
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
        icon: updates.icon || null,
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

  // Quick Links methods
  async getQuickLinks(): Promise<QuickLink[]> {
    const result = await db.select().from(quickLinks).orderBy(quickLinks.id);
    return result;
  }

  async getQuickLink(id: number): Promise<QuickLink | undefined> {
    const [quickLink] = await db.select().from(quickLinks).where(eq(quickLinks.id, id));
    return quickLink || undefined;
  }

  async createQuickLink(insertQuickLink: InsertQuickLink): Promise<QuickLink> {
    const [quickLink] = await db
      .insert(quickLinks)
      .values(insertQuickLink)
      .returning();
    return quickLink;
  }

  async updateQuickLink(id: number, updates: UpdateQuickLink): Promise<QuickLink | undefined> {
    const [quickLink] = await db
      .update(quickLinks)
      .set(updates)
      .where(eq(quickLinks.id, id))
      .returning();
    return quickLink || undefined;
  }

  async deleteQuickLink(id: number): Promise<boolean> {
    const result = await db.delete(quickLinks).where(eq(quickLinks.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getQuickLinksByCategory(category: string): Promise<QuickLink[]> {
    const result = await db.select().from(quickLinks).where(eq(quickLinks.category, category));
    return result;
  }

  // Category management methods
  async getCategories(): Promise<Category[]> {
    const result = await db.select().from(categories).orderBy(categories.name);
    return result;
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return category;
  }

  async updateCategory(id: number, updates: UpdateCategory): Promise<Category | undefined> {
    const [category] = await db
      .update(categories)
      .set(updates)
      .where(eq(categories.id, id))
      .returning();
    return category || undefined;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return (result.rowCount || 0) > 0;
  }

  // RSS Feed CRUD operations
  async getRssFeeds(): Promise<RssFeed[]> {
    const result = await db.select().from(rssFeeds).orderBy(rssFeeds.id);
    return result;
  }

  async getRssFeed(id: number): Promise<RssFeed | undefined> {
    const [rssFeed] = await db.select().from(rssFeeds).where(eq(rssFeeds.id, id));
    return rssFeed || undefined;
  }

  async createRssFeed(insertRssFeed: InsertRssFeed): Promise<RssFeed> {
    const [rssFeed] = await db
      .insert(rssFeeds)
      .values({
        ...insertRssFeed,
        updatedAt: new Date(),
      })
      .returning();
    return rssFeed;
  }

  async updateRssFeed(id: number, updates: UpdateRssFeed): Promise<RssFeed | undefined> {
    const [rssFeed] = await db
      .update(rssFeeds)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(rssFeeds.id, id))
      .returning();
    return rssFeed || undefined;
  }

  async deleteRssFeed(id: number): Promise<boolean> {
    const result = await db.delete(rssFeeds).where(eq(rssFeeds.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getActiveRssFeeds(): Promise<RssFeed[]> {
    const result = await db.select().from(rssFeeds)
      .where(eq(rssFeeds.isActive, true))
      .orderBy(rssFeeds.id);
    return result;
  }
}

export const storage = new DatabaseStorage();
