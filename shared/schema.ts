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

// Bitcoin data type
export interface BitcoinData {
  price: number;
  change24h: number;
  marketCap: number;
  volume: number;
  lastUpdated: string;
}

// RSS feed item type
export interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  guid: string;
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
