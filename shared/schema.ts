import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  category: text("category").notNull(), // VPS, Docker, External, Network
  description: text("description"),
  provider: text("provider"),
  status: text("status").notNull().default("unknown"), // online, offline, warning, unknown
  port: text("port"),
  location: text("location"),
  icon: text("icon"),
  lastChecked: timestamp("last_checked"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  status: true,
  lastChecked: true,
  createdAt: true,
});

export const updateServiceSchema = insertServiceSchema.partial();

export type InsertService = z.infer<typeof insertServiceSchema>;
export type UpdateService = z.infer<typeof updateServiceSchema>;
export type Service = typeof services.$inferSelect;

// Categories schema
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  color: text("color").default("#3B82F6"), // Default blue color
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const updateCategorySchema = insertCategorySchema.partial();

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type UpdateCategory = z.infer<typeof updateCategorySchema>;
export type Category = typeof categories.$inferSelect;

// Quick Links schema
export const quickLinks = pgTable("quick_links", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  icon: text("icon"), // For storing icon name or URL
  category: text("category").default("General"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertQuickLinkSchema = createInsertSchema(quickLinks).omit({
  id: true,
  createdAt: true,
});

export const updateQuickLinkSchema = insertQuickLinkSchema.partial();

export type InsertQuickLink = z.infer<typeof insertQuickLinkSchema>;
export type UpdateQuickLink = z.infer<typeof updateQuickLinkSchema>;
export type QuickLink = typeof quickLinks.$inferSelect;

// Bitcoin data type
export interface BitcoinData {
  price: number;
  change24h: number;
  marketCap: number;
  volume: number;
  lastUpdated: string;
}

// RSS feed item type
// RSS Feeds table
export const rssFeeds = pgTable("rss_feeds", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertRssFeedSchema = createInsertSchema(rssFeeds).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateRssFeedSchema = insertRssFeedSchema.partial();

export type InsertRssFeed = z.infer<typeof insertRssFeedSchema>;
export type UpdateRssFeed = z.infer<typeof updateRssFeedSchema>;
export type RssFeed = typeof rssFeeds.$inferSelect;

export interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  guid: string;
  feedName?: string;
}

// System health type
export interface SystemHealth {
  cpu: number;
  memory: number;
  storage: number;
  networkStatus: string;
  networkDown: number;
  networkUp: number;
}
