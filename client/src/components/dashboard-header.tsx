import { useState, useEffect } from "react";
import { Search, Plus, Server, Edit3, Check, X } from "lucide-react";
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
  const [isEditing, setIsEditing] = useState(false);
  const [dashboardTitle, setDashboardTitle] = useState("Services Dashboard");
  const [tempTitle, setTempTitle] = useState(dashboardTitle);

  const handleSaveTitle = () => {
    setDashboardTitle(tempTitle);
    setIsEditing(false);
    // Save to localStorage for persistence
    localStorage.setItem('dashboardTitle', tempTitle);
  };

  const handleCancelEdit = () => {
    setTempTitle(dashboardTitle);
    setIsEditing(false);
  };

  // Load saved title on component mount
  useEffect(() => {
    const savedTitle = localStorage.getItem('dashboardTitle');
    if (savedTitle) {
      setDashboardTitle(savedTitle);
      setTempTitle(savedTitle);
    }
  }, []);

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Server className="text-white text-lg" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    className="text-2xl font-bold text-white bg-slate-700 border-slate-600 h-8 px-2"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveTitle();
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleSaveTitle}
                    className="h-8 w-8 p-0 text-green-400 hover:text-green-300 hover:bg-slate-700"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelEdit}
                    className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-white">{dashboardTitle}</h1>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditing(true)}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
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
