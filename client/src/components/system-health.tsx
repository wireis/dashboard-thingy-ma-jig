import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Activity } from "lucide-react";
import type { SystemHealth as SystemHealthType } from "@shared/schema";

export default function SystemHealth() {
  const { data: health, isLoading, error } = useQuery<SystemHealthType>({
    queryKey: ["/api/system-health"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getColorForUsage = (usage: number) => {
    if (usage < 50) return "bg-green-500";
    if (usage < 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (error) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">System Health</h3>
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Activity className="text-green-500 w-5 h-5" />
            </div>
          </div>
          <p className="text-red-400 text-sm">Failed to load system health</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">System Health</h3>
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Activity className="text-green-500 w-5 h-5" />
            </div>
          </div>
          <div className="animate-pulse space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1">
                  <div className="h-3 bg-slate-700 rounded w-16"></div>
                  <div className="h-3 bg-slate-700 rounded w-8"></div>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!health) return null;

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">System Health</h3>
          <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
            <Activity className="text-green-500 w-5 h-5" />
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-400">CPU Usage</span>
              <span className="text-slate-200">{health.cpu}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className={`${getColorForUsage(health.cpu)} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${health.cpu}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-400">Memory</span>
              <span className="text-slate-200">{health.memory}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className={`${getColorForUsage(health.memory)} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${health.memory}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-400">Storage</span>
              <span className="text-slate-200">{health.storage}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className={`${getColorForUsage(health.storage)} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${health.storage}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-400">Network</span>
              <span className="text-green-500">{health.networkStatus}</span>
            </div>
            <div className="flex space-x-2 text-xs text-slate-400">
              <span>↓ {health.networkDown} Mbps</span>
              <span>↑ {health.networkUp} Mbps</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
