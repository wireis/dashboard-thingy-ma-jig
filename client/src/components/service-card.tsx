import { ExternalLink, Edit, Server, Container, Cloud, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Service } from "@shared/schema";

interface ServiceCardProps {
  service: Service;
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

export default function ServiceCard({ service }: ServiceCardProps) {
  const Icon = categoryIcons[service.category as keyof typeof categoryIcons] || Server;
  const statusColor = statusColors[service.status as keyof typeof statusColors];
  const statusLabel = statusLabels[service.status as keyof typeof statusLabels];

  const handleOpenService = () => {
    window.open(service.url, "_blank", "noopener,noreferrer");
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
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Icon className="text-blue-500 w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors">
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

        <div className="space-y-2 mb-4 text-sm">
          {service.url && (
            <div className="flex justify-between">
              <span className="text-slate-400">URL:</span>
              <span className="text-slate-200 font-mono text-xs truncate max-w-32">
                {service.url}
              </span>
            </div>
          )}
          {service.port && (
            <div className="flex justify-between">
              <span className="text-slate-400">Port:</span>
              <span className="text-slate-200 font-mono">{service.port}</span>
            </div>
          )}
          {service.location && (
            <div className="flex justify-between">
              <span className="text-slate-400">Location:</span>
              <span className="text-slate-200">{service.location}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-400">Last Check:</span>
            <span className="text-slate-200">{formatLastChecked(service.lastChecked?.toString() || null)}</span>
          </div>
        </div>

        {service.description && (
          <p className="text-xs text-slate-400 mb-4 line-clamp-2">
            {service.description}
          </p>
        )}

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
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
