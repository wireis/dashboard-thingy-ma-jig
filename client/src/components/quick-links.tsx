import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Plus, Edit, Trash2, Globe } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { QuickLink, InsertQuickLink, UpdateQuickLink } from "@shared/schema";
import AddQuickLinkModal from "@/components/add-quick-link-modal";
import EditQuickLinkModal from "@/components/edit-quick-link-modal";

export default function QuickLinks() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<QuickLink | null>(null);
  const queryClient = useQueryClient();

  const { data: quickLinks = [], isLoading, refetch } = useQuery<QuickLink[]>({
    queryKey: ["/api/quick-links"],
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/quick-links/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quick-links"] });
      queryClient.refetchQueries({ queryKey: ["/api/quick-links"] });
    },
  });

  const handleEditLink = (link: QuickLink) => {
    setEditingLink(link);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingLink(null);
  };

  const handleDeleteLink = (id: number) => {
    if (confirm("Are you sure you want to delete this quick link?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Quick Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Quick Links
          </CardTitle>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Link
          </Button>
        </CardHeader>
        <CardContent>
          {quickLinks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No quick links yet</p>
              <p className="text-sm mb-4">Add your frequently used websites for easy access</p>
              <Button onClick={() => setIsAddModalOpen(true)}>Add your first link</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {quickLinks.map((link: QuickLink) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <ExternalLink className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm truncate">{link.name}</h3>
                        {link.category && link.category !== "General" && (
                          <Badge variant="outline" className="text-xs">
                            {link.category}
                          </Badge>
                        )}
                      </div>
                      {link.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {link.description}
                        </p>
                      )}
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 truncate block"
                      >
                        {link.url}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="px-3"
                    >
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditLink(link)}
                      className="px-3"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteLink(link.id)}
                      className="px-3 text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddQuickLinkModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <EditQuickLinkModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        quickLink={editingLink}
      />
    </>
  );
}