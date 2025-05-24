import { useState, useEffect } from "react";
import DashboardHeader from "@/components/dashboard-header";
import QuickStats from "@/components/quick-stats";
import ServicesGrid from "@/components/services-grid";
import RSSFeed from "@/components/rss-feed";
import SystemHealth from "@/components/system-health";
import SimpleQuickLinks from "@/components/simple-quick-links";
import HiddenServices from "@/components/hidden-services";

import AddServiceModal from "@/components/add-service-modal";
import CategoryManagementModal from "@/components/category-management-modal";

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showHiddenServices, setShowHiddenServices] = useState(false);

  // Keyboard shortcut to toggle hidden services with 'H' key
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'h' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        // Only trigger if not typing in an input field
        if (event.target && (event.target as HTMLElement).tagName !== 'INPUT' && (event.target as HTMLElement).tagName !== 'TEXTAREA') {
          setShowHiddenServices(prev => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900">
      <DashboardHeader 
        onAddService={() => setIsModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <QuickStats />
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <ServicesGrid 
              searchQuery={searchQuery}
            />
            
            {showHiddenServices && (
              <div className="mt-8">
                <HiddenServices 
                  isVisible={showHiddenServices}
                  onToggle={() => setShowHiddenServices(false)}
                />
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            <SimpleQuickLinks />
            <RSSFeed />
            <SystemHealth />
          </div>
        </div>
      </main>

      <AddServiceModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
