import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { updateQuickLinkSchema, type UpdateQuickLink, type QuickLink } from "@shared/schema";

interface EditQuickLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  quickLink: QuickLink | null;
}

export default function EditQuickLinkModal({ isOpen, onClose, quickLink }: EditQuickLinkModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<UpdateQuickLink>({
    resolver: zodResolver(updateQuickLinkSchema),
    defaultValues: {
      name: "",
      url: "",
      description: "",
      icon: "",
      category: "General",
    },
  });

  // Update form when quickLink changes
  useEffect(() => {
    if (quickLink && isOpen) {
      form.reset({
        name: quickLink.name || "",
        url: quickLink.url || "",
        description: quickLink.description || "",
        icon: quickLink.icon || "",
        category: quickLink.category || "General",
      });
    }
  }, [quickLink, isOpen, form]);

  const mutation = useMutation({
    mutationFn: async (data: UpdateQuickLink) => {
      if (!quickLink) throw new Error("No quick link selected");
      const response = await fetch(`/api/quick-links/${quickLink.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quick-links"] });
      toast({
        title: "Success",
        description: "Quick link updated successfully",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update quick link",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: UpdateQuickLink) => {
    // Ensure URL has protocol if provided
    if (data.url && !data.url.startsWith("http://") && !data.url.startsWith("https://")) {
      data.url = "https://" + data.url;
    }
    mutation.mutate(data);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  if (!quickLink) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Quick Link</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="e.g., GitHub"
                disabled={mutation.isPending}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={form.watch("category") || "General"}
                onValueChange={(value) => form.setValue("category", value)}
                disabled={mutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Development">Development</SelectItem>
                  <SelectItem value="Social">Social</SelectItem>
                  <SelectItem value="Work">Work</SelectItem>
                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                  <SelectItem value="Utilities">Utilities</SelectItem>
                  <SelectItem value="News">News</SelectItem>
                  <SelectItem value="Shopping">Shopping</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              {...form.register("url")}
              placeholder="e.g., github.com or https://github.com"
              disabled={mutation.isPending}
            />
            {form.formState.errors.url && (
              <p className="text-sm text-red-500">{form.formState.errors.url.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Optional description..."
              rows={2}
              disabled={mutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Icon</Label>
            <Input
              id="icon"
              {...form.register("icon")}
              placeholder="Optional icon name or URL"
              disabled={mutation.isPending}
            />
            <p className="text-xs text-gray-500">
              You can use Lucide icon names (e.g., "github") or icon URLs
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Updating..." : "Update Link"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}