import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, Rss, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { RssFeed, InsertRssFeed, UpdateRssFeed } from "@shared/schema";

interface RssFeedManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EditingFeed {
  id?: number;
  name: string;
  url: string;
  description: string;
  isActive: boolean;
}

export default function RssFeedManagementModal({ isOpen, onClose }: RssFeedManagementModalProps) {
  const [editingFeed, setEditingFeed] = useState<EditingFeed | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: feeds = [], isLoading } = useQuery<RssFeed[]>({
    queryKey: ["/api/rss-feeds"],
    enabled: isOpen,
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertRssFeed) => {
      const response = await apiRequest("/api/rss-feeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create RSS feed");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rss-feeds"] });
      toast({ title: "RSS feed created successfully" });
      setEditingFeed(null);
      setIsAddingNew(false);
    },
    onError: () => {
      toast({ title: "Failed to create RSS feed", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateRssFeed }) => {
      const response = await apiRequest(`/api/rss-feeds/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update RSS feed");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rss-feeds"] });
      toast({ title: "RSS feed updated successfully" });
      setEditingFeed(null);
    },
    onError: () => {
      toast({ title: "Failed to update RSS feed", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(`/api/rss-feeds/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete RSS feed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rss-feeds"] });
      toast({ title: "RSS feed deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete RSS feed", variant: "destructive" });
    },
  });

  const startEditing = (feed: RssFeed) => {
    setEditingFeed({
      id: feed.id,
      name: feed.name,
      url: feed.url,
      description: feed.description || "",
      isActive: feed.isActive,
    });
    setIsAddingNew(false);
  };

  const startAddingNew = () => {
    setEditingFeed({
      name: "",
      url: "",
      description: "",
      isActive: true,
    });
    setIsAddingNew(true);
  };

  const handleSave = () => {
    if (!editingFeed) return;

    if (!editingFeed.name.trim() || !editingFeed.url.trim()) {
      toast({ title: "Name and URL are required", variant: "destructive" });
      return;
    }

    if (isAddingNew) {
      createMutation.mutate({
        name: editingFeed.name.trim(),
        url: editingFeed.url.trim(),
        description: editingFeed.description.trim() || undefined,
        isActive: editingFeed.isActive,
      });
    } else if (editingFeed.id) {
      updateMutation.mutate({
        id: editingFeed.id,
        data: {
          name: editingFeed.name.trim(),
          url: editingFeed.url.trim(),
          description: editingFeed.description.trim() || undefined,
          isActive: editingFeed.isActive,
        },
      });
    }
  };

  const handleCancel = () => {
    setEditingFeed(null);
    setIsAddingNew(false);
  };

  useEffect(() => {
    if (!isOpen) {
      setEditingFeed(null);
      setIsAddingNew(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-slate-800 border-slate-700 text-white max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rss className="w-5 h-5" />
            RSS Feed Management
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New RSS Feed Button */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-400">
              Manage your RSS feeds to display news and updates from multiple sources
            </p>
            <Button
              onClick={startAddingNew}
              disabled={!!editingFeed}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add RSS Feed
            </Button>
          </div>

          {/* Edit Form */}
          {editingFeed && (
            <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
              <h3 className="font-semibold mb-4">
                {isAddingNew ? "Add New RSS Feed" : "Edit RSS Feed"}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="feed-name">Name *</Label>
                  <Input
                    id="feed-name"
                    value={editingFeed.name}
                    onChange={(e) => setEditingFeed({ ...editingFeed, name: e.target.value })}
                    placeholder="e.g., BBC News"
                    className="bg-slate-600 border-slate-500 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="feed-url">RSS URL *</Label>
                  <Input
                    id="feed-url"
                    value={editingFeed.url}
                    onChange={(e) => setEditingFeed({ ...editingFeed, url: e.target.value })}
                    placeholder="https://example.com/rss.xml"
                    className="bg-slate-600 border-slate-500 text-white"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="feed-description">Description</Label>
                  <Textarea
                    id="feed-description"
                    value={editingFeed.description}
                    onChange={(e) => setEditingFeed({ ...editingFeed, description: e.target.value })}
                    placeholder="Optional description for this RSS feed"
                    className="bg-slate-600 border-slate-500 text-white"
                    rows={2}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="feed-active"
                    checked={editingFeed.isActive}
                    onCheckedChange={(checked) => setEditingFeed({ ...editingFeed, isActive: checked })}
                  />
                  <Label htmlFor="feed-active">Active</Label>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={handleSave}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isAddingNew ? "Create" : "Update"}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* RSS Feeds List */}
          <div className="space-y-3">
            <h3 className="font-semibold">Current RSS Feeds</h3>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-slate-700 p-4 rounded-lg animate-pulse">
                    <div className="h-4 bg-slate-600 rounded mb-2"></div>
                    <div className="h-3 bg-slate-600 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : feeds.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Rss className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No RSS feeds configured yet</p>
                <p className="text-sm">Add your first RSS feed to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {feeds.map((feed: RssFeed) => (
                  <div key={feed.id} className="bg-slate-700 p-4 rounded-lg border border-slate-600">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{feed.name}</h4>
                          {!feed.isActive && (
                            <span className="px-2 py-1 text-xs bg-red-600 rounded">Inactive</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 mb-1">{feed.url}</p>
                        {feed.description && (
                          <p className="text-sm text-slate-300">{feed.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditing(feed)}
                          disabled={!!editingFeed}
                          className="border-slate-600 text-slate-300 hover:bg-slate-600"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteMutation.mutate(feed.id)}
                          disabled={deleteMutation.isPending}
                          className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}