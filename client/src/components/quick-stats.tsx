import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Network, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import type { Service } from "@shared/schema";

export default function QuickStats() {
  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const stats = {
    total: services.length,
    online: services.filter(s => s.status === "online").length,
    warning: services.filter(s => s.status === "warning").length,
    offline: services.filter(s => s.status === "offline" || s.status === "unknown").length,
  };

  const statCards = [
    {
      title: "Total Services",
      value: stats.total,
      icon: Network,
      color: "text-blue-500",
      bgColor: "bg-blue-500/20",
    },
    {
      title: "Online",
      value: stats.online,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/20",
    },
    {
      title: "Issues",
      value: stats.warning,
      icon: AlertTriangle,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/20",
    },
    {
      title: "Offline",
      value: stats.offline,
      icon: XCircle,
      color: "text-red-500",
      bgColor: "bg-red-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat) => (
        <Card key={stat.title} className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`${stat.color} text-xl w-6 h-6`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
