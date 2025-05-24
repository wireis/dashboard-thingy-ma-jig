import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertServiceSchema, updateServiceSchema, insertQuickLinkSchema, updateQuickLinkSchema, insertCategorySchema, updateCategorySchema, insertRssFeedSchema, updateRssFeedSchema, type RSSItem } from "@shared/schema";
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
      const response = await fetch("https://www.gbnews.com/feeds/politics.rss", {
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

  // System health endpoint (Glances integration)
  app.get("/api/system-health", async (req, res) => {
    try {
      const glancesUrl = process.env.GLANCES_URL;
      const glancesPassword = process.env.GLANCES_PASSWORD;
      
      if (!glancesUrl) {
        // Fallback to mock data if Glances not configured
        const health = {
          cpu: Math.floor(Math.random() * 40) + 10,
          memory: Math.floor(Math.random() * 50) + 30,
          storage: Math.floor(Math.random() * 60) + 20,
          networkStatus: "Glances Not Configured",
          networkDown: 0,
          networkUp: 0,
        };
        return res.json(health);
      }

      // Fetch data from Glances API
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };

      if (glancesPassword) {
        headers['Authorization'] = `Basic ${Buffer.from(`glances:${glancesPassword}`).toString('base64')}`;
      }

      const [cpuResponse, memResponse, fsResponse, networkResponse] = await Promise.allSettled([
        fetch(`${glancesUrl}/api/3/cpu`, { headers }),
        fetch(`${glancesUrl}/api/3/mem`, { headers }),
        fetch(`${glancesUrl}/api/3/fs`, { headers }),
        fetch(`${glancesUrl}/api/3/network`, { headers })
      ]);

      let cpu = 0, memory = 0, storage = 0;
      let networkDown = 0, networkUp = 0, networkStatus = "Unknown";

      // Parse CPU data
      if (cpuResponse.status === 'fulfilled' && cpuResponse.value.ok) {
        const cpuData = await cpuResponse.value.json();
        cpu = Math.round(cpuData.total || 0);
      }

      // Parse Memory data
      if (memResponse.status === 'fulfilled' && memResponse.value.ok) {
        const memData = await memResponse.value.json();
        memory = Math.round((memData.percent || 0));
      }

      // Parse Filesystem data (get highest usage)
      if (fsResponse.status === 'fulfilled' && fsResponse.value.ok) {
        const fsData = await fsResponse.value.json();
        if (Array.isArray(fsData) && fsData.length > 0) {
          storage = Math.round(Math.max(...fsData.map(fs => fs.percent || 0)));
        }
      }

      // Parse Network data
      if (networkResponse.status === 'fulfilled' && networkResponse.value.ok) {
        const networkData = await networkResponse.value.json();
        if (Array.isArray(networkData) && networkData.length > 0) {
          // Sum all network interfaces
          const totalRx = networkData.reduce((sum, iface) => sum + (iface.rx_sec || 0), 0);
          const totalTx = networkData.reduce((sum, iface) => sum + (iface.tx_sec || 0), 0);
          
          // Convert bytes/sec to Mbps
          networkDown = Math.round((totalRx * 8) / 1000000);
          networkUp = Math.round((totalTx * 8) / 1000000);
          networkStatus = "Connected";
        }
      }

      const health = {
        cpu,
        memory,
        storage,
        networkStatus: networkStatus || "Connected",
        networkDown,
        networkUp,
      };
      
      res.json(health);
    } catch (error) {
      console.error("Glances API error:", error);
      res.status(500).json({ error: "Failed to fetch system health from Glances" });
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

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid category data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  app.put("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateCategorySchema.parse(req.body);
      const category = await storage.updateCategory(id, validatedData);
      
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid category data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCategory(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Category not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

  const httpServer = createServer(app);
  // Quick Links routes
  app.get("/api/quick-links", async (req, res) => {
    try {
      const quickLinks = await storage.getQuickLinks();
      res.json(quickLinks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quick links" });
    }
  });

  app.get("/api/quick-links", async (req, res) => {
    try {
      const { category } = req.query;
      
      let quickLinks;
      if (category) {
        quickLinks = await storage.getQuickLinksByCategory(category as string);
      } else {
        quickLinks = await storage.getQuickLinks();
      }
      
      res.json(quickLinks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quick links" });
    }
  });

  app.get("/api/quick-links/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const quickLink = await storage.getQuickLink(id);
      if (!quickLink) {
        return res.status(404).json({ error: "Quick link not found" });
      }
      res.json(quickLink);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quick link" });
    }
  });

  app.post("/api/quick-links", async (req, res) => {
    try {
      const validatedData = insertQuickLinkSchema.parse(req.body);
      const quickLink = await storage.createQuickLink(validatedData);
      res.status(201).json(quickLink);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create quick link" });
    }
  });

  app.patch("/api/quick-links/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateQuickLinkSchema.parse(req.body);
      const quickLink = await storage.updateQuickLink(id, validatedData);
      if (!quickLink) {
        return res.status(404).json({ error: "Quick link not found" });
      }
      res.json(quickLink);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update quick link" });
    }
  });

  app.delete("/api/quick-links/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteQuickLink(id);
      if (!success) {
        return res.status(404).json({ error: "Quick link not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete quick link" });
    }
  });

  return httpServer;
}
