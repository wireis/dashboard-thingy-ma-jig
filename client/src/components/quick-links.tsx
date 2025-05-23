import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, Plus, Globe, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface QuickLink {
  id: number;
  name: string;
  url: string;
  description?: string;
  category?: string;
}

export default function QuickLinks() {
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLink, setNewLink] = useState({ name: "", url: "", description: "" });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch quick links
  const fetchQuickLinks = async () => {
    try {
      const response = await fetch("/api/quick-links", {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      const text = await response.text();
      
      if (response.ok && text) {
        try {
          const data = JSON.parse(text);
          console.log("Fetched quick links:", data);
          setQuickLinks(Array.isArray(data) ? data : []);
        } catch (parseError) {
          console.error("Failed to parse JSON:", parseError, "Response:", text.substring(0, 200));
          setQuickLinks([]);
        }
      } else {
        console.error("Failed to fetch quick links - status:", response.status, "Response:", text.substring(0, 200));
        setQuickLinks([]);
      }
    } catch (error) {
      console.error("Failed to fetch quick links:", error);
      setQuickLinks([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add quick link
  const handleAddLink = async () => {
    if (!newLink.name || !newLink.url) return;
    
    try {
      const linkData = {
        ...newLink,
        url: newLink.url.startsWith("http") ? newLink.url : `https://${newLink.url}`,
        category: "General"
      };
      
      const response = await fetch("/api/quick-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(linkData),
      });
      
      if (response.ok) {
        const savedLink = await response.json();
        setQuickLinks(prev => [...prev, savedLink]);
        setNewLink({ name: "", url: "", description: "" });
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Failed to add quick link:", error);
    }
  };

  // Delete quick link
  const handleDeleteLink = async (id: number) => {
    if (!confirm("Are you sure you want to delete this quick link?")) return;
    
    try {
      const response = await fetch(`/api/quick-links/${id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        setQuickLinks(prev => prev.filter(link => link.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete quick link:", error);
    }
  };

  useEffect(() => {
    fetchQuickLinks();
  }, []);

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
            onClick={() => setIsModalOpen(true)}
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
              <Button onClick={() => setIsModalOpen(true)}>Add your first link</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {quickLinks.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <ExternalLink className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate mb-1">{link.name}</h3>
                      {link.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate mb-1">
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add Quick Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Name</label>
              <Input
                value={newLink.name}
                onChange={(e) => setNewLink(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., GitHub"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">URL</label>
              <Input
                value={newLink.url}
                onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                placeholder="e.g., github.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description (optional)</label>
              <Input
                value={newLink.description}
                onChange={(e) => setNewLink(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddLink} disabled={!newLink.name || !newLink.url}>
                Add Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}