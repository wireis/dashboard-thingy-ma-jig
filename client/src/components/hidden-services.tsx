import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import ServiceCard from "./service-card";
import EditServiceModal from "./edit-service-modal";
import type { Service } from "@shared/schema";

interface HiddenServicesProps {
  isVisible: boolean;
  onToggle: () => void;
}

export default function HiddenServices({ isVisible, onToggle }: HiddenServicesProps) {
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: hiddenServices = [], isLoading } = useQuery<Service[]>({
    queryKey: ["/api/services/hidden"],
    enabled: isVisible,
  });

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingService(null);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <Card className="bg-slate-800 border-slate-700 border-2 border-orange-500/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <EyeOff className="text-orange-500 w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Hidden Services</h2>
                <p className="text-sm text-slate-400">Press 'H' to toggle visibility</p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>

          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-slate-700 rounded-xl"></div>
                ))}
              </div>
            </div>
          ) : hiddenServices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400 text-lg">No hidden services</p>
              <p className="text-slate-500 text-sm mt-2">
                Mark services as hidden when creating or editing them
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hiddenServices.map((service) => (
                <ServiceCard key={service.id} service={service} onEdit={handleEditService} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <EditServiceModal 
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        service={editingService}
      />
    </>
  );
}