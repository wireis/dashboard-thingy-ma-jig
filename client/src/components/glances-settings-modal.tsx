import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface GlancesSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GlancesSettings {
  url: string;
  username?: string;
  password?: string;
  enabled: boolean;
}

export default function GlancesSettingsModal({ isOpen, onClose }: GlancesSettingsModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [settings, setSettings] = useState<GlancesSettings>({
    url: "http://localhost:61208",
    username: "",
    password: "",
    enabled: true
  });

  const { data: currentSettings } = useQuery<GlancesSettings>({
    queryKey: ["/api/settings/glances"],
    enabled: isOpen,
  });

  // Update local state when current settings are loaded
  useState(() => {
    if (currentSettings) {
      setSettings(currentSettings);
    }
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (data: GlancesSettings) => {
      const response = await fetch("/api/settings/glances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/glances"] });
      queryClient.invalidateQueries({ queryKey: ["/api/system-health"] });
      toast({
        title: "Settings saved!",
        description: "Glances configuration has been updated successfully.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save Glances settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/settings/glances/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Connection successful!",
          description: "Successfully connected to your Glances instance.",
        });
      } else {
        toast({
          title: "Connection failed",
          description: data.error || "Could not connect to Glances instance.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Test failed",
        description: "Failed to test connection. Please check your settings.",
        variant: "destructive",
      });
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettingsMutation.mutate(settings);
  };

  const handleTestConnection = () => {
    testConnectionMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Glances Settings</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url" className="text-slate-300">
              Glances URL
            </Label>
            <Input
              id="url"
              type="url"
              value={settings.url}
              onChange={(e) => setSettings({ ...settings, url: e.target.value })}
              placeholder="http://your-server:61208"
              className="bg-slate-700 border-slate-600 text-white"
              required
            />
            <p className="text-xs text-slate-400">
              The URL where your Glances instance is running (typically port 61208)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-slate-300">
              Username (optional)
            </Label>
            <Input
              id="username"
              type="text"
              value={settings.username || ""}
              onChange={(e) => setSettings({ ...settings, username: e.target.value })}
              placeholder="Leave empty if no authentication"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-300">
              Password (optional)
            </Label>
            <Input
              id="password"
              type="password"
              value={settings.password || ""}
              onChange={(e) => setSettings({ ...settings, password: e.target.value })}
              placeholder="Leave empty if no authentication"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="enabled"
              checked={settings.enabled}
              onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
              className="rounded border-slate-600"
            />
            <Label htmlFor="enabled" className="text-slate-300">
              Enable Glances monitoring
            </Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleTestConnection}
              disabled={testConnectionMutation.isPending}
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              {testConnectionMutation.isPending ? "Testing..." : "Test Connection"}
            </Button>
            
            <Button
              type="submit"
              disabled={saveSettingsMutation.isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {saveSettingsMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}