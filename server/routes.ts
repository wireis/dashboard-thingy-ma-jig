import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertServiceSchema, updateServiceSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Service routes
  app.get("/api/services", async (req, res) => {
    try {
      const { category, search } = req.query;
      
      let services;
      if (search) {
        services = await storage.searchServices(search as string);
      } else if (category) {
        services = await storage.getServicesByCategory(category as string);
      } else {
        services = await storage.getServices();
      }
      
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  app.get("/api/services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const service = await storage.getService(id);
      
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }
      
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service" });
    }
  });

  app.post("/api/services", async (req, res) => {
    try {
      const validatedData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(validatedData);
      res.status(201).json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid service data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create service" });
    }
  });

  app.put("/api/services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateServiceSchema.parse(req.body);
      const service = await storage.updateService(id, validatedData);
      
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }
      
      res.json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid service data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update service" });
    }
  });

  app.delete("/api/services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteService(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Service not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete service" });
    }
  });

  // Bitcoin price endpoint
  app.get("/api/bitcoin", async (req, res) => {
    try {
      const apiKey = process.env.COINGECKO_API_KEY;
      
      // Use demo API endpoint for demo keys, pro API for paid keys
      const baseUrl = "https://api.coingecko.com/api/v3/simple/price";
      const fetchOptions: RequestInit = {};
      
      if (apiKey) {
        fetchOptions.headers = { 'x-cg-demo-api-key': apiKey };
      }
      
      const response = await fetch(
        `${baseUrl}?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`,
        fetchOptions
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please provide a CoinGecko API key for reliable access.");
        }
        throw new Error(errorData.message || "Failed to fetch Bitcoin data");
      }
      
      const data = await response.json();
      
      // Check if the response contains an error
      if (data.status && data.status.error_code) {
        throw new Error(data.status.error_message || "API returned an error");
      }
      
      const bitcoin = data.bitcoin;
      
      if (!bitcoin) {
        throw new Error("Invalid API response format");
      }
      
      const bitcoinData = {
        price: bitcoin.usd || 0,
        change24h: bitcoin.usd_24h_change || 0,
        marketCap: bitcoin.usd_market_cap || 0,
        volume: bitcoin.usd_24h_vol || 0,
        lastUpdated: new Date().toISOString(),
      };
      
      res.json(bitcoinData);
    } catch (error) {
      console.error("Bitcoin API error:", error);
      res.status(500).json({ 
        error: "Failed to fetch Bitcoin data",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // RSS feed endpoint for GB News
  app.get("/api/rss/gb-news", async (req, res) => {
    try {
      const response = await fetch("https://www.gbnews.com/feed", {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; RSS Reader)',
          'Accept': 'application/rss+xml, application/xml, text/xml'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const xmlText = await response.text();
      
      // Simple XML parsing for RSS
      const items = [];
      const itemMatches = xmlText.match(/<item[^>]*>(.*?)<\/item>/gs);
      
      if (itemMatches) {
        for (let i = 0; i < Math.min(itemMatches.length, 10); i++) {
          const item = itemMatches[i];
          const title = item.match(/<title[^>]*><!\[CDATA\[(.*?)\]\]><\/title>/s)?.[1] || 
                       item.match(/<title[^>]*>(.*?)<\/title>/s)?.[1] || "";
          const link = item.match(/<link[^>]*>(.*?)<\/link>/s)?.[1] || "";
          const description = item.match(/<description[^>]*><!\[CDATA\[(.*?)\]\]><\/description>/s)?.[1] || 
                             item.match(/<description[^>]*>(.*?)<\/description>/s)?.[1] || "";
          const pubDate = item.match(/<pubDate[^>]*>(.*?)<\/pubDate>/s)?.[1] || "";
          const guid = item.match(/<guid[^>]*>(.*?)<\/guid>/s)?.[1] || `${i}`;
          
          if (title) {
            items.push({
              title: title.trim(),
              link: link.trim(),
              description: description.replace(/<[^>]*>/g, "").trim().substring(0, 200),
              pubDate,
              guid,
            });
          }
        }
      }
      
      res.json(items);
    } catch (error) {
      console.error("RSS feed error:", error);
      res.status(500).json({ 
        error: "Failed to fetch RSS feed",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // System health endpoint (mock data)
  app.get("/api/system-health", async (req, res) => {
    try {
      // In a real implementation, this would gather actual system metrics
      const health = {
        cpu: Math.floor(Math.random() * 40) + 10, // 10-50%
        memory: Math.floor(Math.random() * 50) + 30, // 30-80%
        storage: Math.floor(Math.random() * 60) + 20, // 20-80%
        networkStatus: "Optimal",
        networkDown: Math.floor(Math.random() * 200) + 50, // 50-250 Mbps
        networkUp: Math.floor(Math.random() * 100) + 25, // 25-125 Mbps
      };
      
      res.json(health);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch system health" });
    }
  });

  // Service health check endpoint
  app.post("/api/services/:id/check", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const service = await storage.getService(id);
      
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }
      
      // Attempt to check service health
      let status = "offline";
      try {
        const healthResponse = await fetch(service.url, { 
          method: "HEAD", 
          timeout: 5000 
        });
        status = healthResponse.ok ? "online" : "warning";
      } catch {
        status = "offline";
      }
      
      await storage.updateServiceStatus(id, status);
      
      res.json({ status });
    } catch (error) {
      res.status(500).json({ error: "Failed to check service health" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
