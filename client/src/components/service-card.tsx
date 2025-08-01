import { ExternalLink, Edit, Server, Container, Cloud, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Service } from "@shared/schema";

interface ServiceCardProps {
  service: Service;
  onEdit: (service: Service) => void;
}

const categoryIcons = {
  VPS: Server,
  Docker: Container,
  External: Cloud,
  Network: Shield,
};

const statusColors = {
  online: "bg-green-500",
  offline: "bg-red-500",
  warning: "bg-yellow-500",
  unknown: "bg-gray-500",
};

const statusLabels = {
  online: "Online",
  offline: "Offline",
  warning: "Warning",
  unknown: "Unknown",
};

export default function ServiceCard({ service, onEdit }: ServiceCardProps) {
  const Icon = categoryIcons[service.category as keyof typeof categoryIcons] || Server;
  const statusColor = statusColors[service.status as keyof typeof statusColors];
  const statusLabel = statusLabels[service.status as keyof typeof statusLabels];

  const handleOpenService = () => {
    let fullUrl = service.url;
    
    // Add port if specified and not already in URL
    if (service.port && !service.url.includes(':' + service.port)) {
      // Remove trailing slash if present
      const baseUrl = service.url.replace(/\/$/, '');
      fullUrl = `${baseUrl}:${service.port}`;
    }
    
    window.open(fullUrl, "_blank", "noopener,noreferrer");
  };

  const formatLastChecked = (date: string | null) => {
    if (!date) return "Never";
    const now = new Date();
    const lastChecked = new Date(date);
    const diffMinutes = Math.floor((now.getTime() - lastChecked.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hr ago`;
    return `${Math.floor(diffMinutes / 1440)} days ago`;
  };

  return (
    <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-all duration-200 cursor-pointer group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-9 h-9 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              {service.icon ? (
                <img 
                  src={service.icon} 
                  alt={`${service.name} icon`}
                  className="w-5 h-5 object-contain"
                  onError={(e) => {
                    // Fallback to default icon if custom icon fails to load
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                    const nextElement = target.nextElementSibling as HTMLElement;
                    if (nextElement) {
                      nextElement.classList.remove('hidden');
                    }
                  }}
                />
              ) : null}
              <Icon className={`text-blue-500 w-4 h-4 ${service.icon ? 'hidden' : ''}`} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors text-sm truncate">
                {service.name}
              </h3>
              <p className="text-sm text-slate-400">{service.provider || service.category}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 ${statusColor} rounded-full`}></div>
            <Badge variant="secondary" className="text-xs">
              {statusLabel}
            </Badge>
          </div>
        </div>





        <div className="flex space-x-2">
          <Button
            onClick={handleOpenService}
            className="flex-1 bg-primary hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Access
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(service)}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
