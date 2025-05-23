import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import ServiceCard from "./service-card";
import type { Service } from "@shared/schema";

interface ServicesGridProps {
  searchQuery: string;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function ServicesGrid({ 
  searchQuery, 
  selectedCategory, 
  onCategoryChange 
}: ServicesGridProps) {
  const { data: services = [], isLoading } = useQuery<Service[]>({
    queryKey: ["/api/services", { category: selectedCategory, search: searchQuery }],
  });

  const categories = ["All", "VPS", "Docker", "External", "Network"];

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-slate-700 rounded mb-6 w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-800 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Your Services</h2>
        <div className="flex space-x-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "secondary"}
              size="sm"
              onClick={() => onCategoryChange(category)}
              className={
                selectedCategory === category
                  ? "bg-primary text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400 text-lg">No services found</p>
          <p className="text-slate-500 text-sm mt-2">
            {searchQuery ? "Try adjusting your search" : "Add your first service to get started"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  );
}
