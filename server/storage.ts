import { services, type Service, type InsertService, type UpdateService } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private services: Map<number, Service>;
  private currentId: number;

  constructor() {
    this.services = new Map();
    this.currentId = 1;
    this.initializeDefaultServices();
  }

  private initializeDefaultServices() {
    // Add some default services for demonstration
    const defaultServices: InsertService[] = [
      {
        name: "Main VPS",
        url: "https://165.232.123.45",
        category: "VPS",
        description: "Primary Digital Ocean VPS hosting main applications",
        provider: "Digital Ocean",
        location: "London, UK",
      },
      {
        name: "Nextcloud",
        url: "http://localhost:8080",
        category: "Docker",
        description: "Self-hosted cloud storage and collaboration platform",
        provider: "Docker Container",
        port: "8080",
      },
      {
        name: "Plex Media Server",
        url: "http://localhost:32400",
        category: "Docker",
        description: "Media streaming server for movies and TV shows",
        provider: "Docker Container",
        port: "32400",
      },
      {
        name: "Portainer",
        url: "http://localhost:9000",
        category: "Docker",
        description: "Docker container management interface",
        provider: "Docker Management",
        port: "9000",
      },
      {
        name: "IONOS VPS",
        url: "https://82.165.79.142",
        category: "VPS",
        description: "Secondary VPS for backup services",
        provider: "IONOS Cloud",
        location: "Frankfurt, DE",
      },
      {
        name: "Pi-hole",
        url: "http://192.168.1.100:8081",
        category: "Network",
        description: "Network-wide ad blocker and DNS server",
        provider: "Raspberry Pi",
        port: "8081",
      },
    ];

    defaultServices.forEach(service => {
      this.createService(service);
    });
  }

  async getServices(): Promise<Service[]> {
    return Array.from(this.services.values()).sort((a, b) => a.id - b.id);
  }

  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async createService(insertService: InsertService): Promise<Service> {
    const id = this.currentId++;
    const service: Service = {
      ...insertService,
      id,
      status: "unknown",
      lastChecked: null,
      createdAt: new Date(),
    };
    this.services.set(id, service);
    return service;
  }

  async updateService(id: number, updates: UpdateService): Promise<Service | undefined> {
    const existingService = this.services.get(id);
    if (!existingService) {
      return undefined;
    }

    const updatedService: Service = {
      ...existingService,
      ...updates,
    };

    this.services.set(id, updatedService);
    return updatedService;
  }

  async deleteService(id: number): Promise<boolean> {
    return this.services.delete(id);
  }

  async updateServiceStatus(id: number, status: string): Promise<void> {
    const service = this.services.get(id);
    if (service) {
      service.status = status;
      service.lastChecked = new Date();
      this.services.set(id, service);
    }
  }

  async searchServices(query: string): Promise<Service[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.services.values()).filter(service =>
      service.name.toLowerCase().includes(lowercaseQuery) ||
      service.description?.toLowerCase().includes(lowercaseQuery) ||
      service.provider?.toLowerCase().includes(lowercaseQuery) ||
      service.category.toLowerCase().includes(lowercaseQuery)
    );
  }

  async getServicesByCategory(category: string): Promise<Service[]> {
    if (category === "All") {
      return this.getServices();
    }
    return Array.from(this.services.values()).filter(service =>
      service.category === category
    );
  }
}

export const storage = new MemStorage();
