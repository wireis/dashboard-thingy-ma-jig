import { Search, Plus, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DashboardHeaderProps {
  onAddService: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function DashboardHeader({ 
  onAddService, 
  searchQuery, 
  onSearchChange 
}: DashboardHeaderProps) {
  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Server className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Services Dashboard</h1>
            <p className="text-slate-400 text-sm">Manage your self-hosted infrastructure</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-slate-800 border-slate-600 rounded-lg px-4 py-2 pl-10 text-sm focus:ring-2 focus:ring-primary focus:border-transparent w-64"
            />
            <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
          </div>
          
          <Button 
            onClick={onAddService}
            className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </div>
      </div>
    </header>
  );
}
