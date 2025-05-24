import { useState } from "react";
import DashboardHeader from "@/components/dashboard-header";
import QuickStats from "@/components/quick-stats";
import ServicesGrid from "@/components/services-grid";
import RSSFeed from "@/components/rss-feed";
import SystemHealth from "@/components/system-health";
import SimpleQuickLinks from "@/components/simple-quick-links";

import AddServiceModal from "@/components/add-service-modal";
import CategoryManagementModal from "@/components/category-management-modal";

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  return (
    <div className="min-h-screen bg-slate-900">
      <DashboardHeader 
        onAddService={() => setIsModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <QuickStats />
        
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-3">
            <ServicesGrid 
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
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
