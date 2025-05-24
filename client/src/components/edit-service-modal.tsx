import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { updateServiceSchema, type UpdateService, type Service } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface EditServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
}

export default function EditServiceModal({ isOpen, onClose, service }: EditServiceModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<UpdateService>({
    resolver: zodResolver(updateServiceSchema),
    defaultValues: {
      name: "",
      url: "",
      category: "Docker",
      description: "",
      provider: "",
      port: "",
      location: "",
      icon: "",
    },
  });

  // Reset form when service changes
  useEffect(() => {
    if (service) {
      form.reset({
        name: service.name,
        url: service.url,
        category: service.category,
        description: service.description || "",
        provider: service.provider || "",
        port: service.port || "",
        location: service.location || "",
        icon: service.icon || "",
      });
    }
  }, [service, form]);

  const updateServiceMutation = useMutation({
    mutationFn: async (data: UpdateService) => {
      if (!service) throw new Error("No service to update");
      const response = await apiRequest("PUT", `/api/services/${service.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "Service updated",
        description: "Your service has been successfully updated.",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update service. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: UpdateService) => {
    setIsSubmitting(true);
    updateServiceMutation.mutate(data);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!service) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-800 border-slate-700 max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            Edit Service
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Service Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter service name"
                      {...field}
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">URL/IP Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com or 192.168.1.100"
                      {...field}
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="Docker">Docker Container</SelectItem>
                      <SelectItem value="VPS">VPS</SelectItem>
                      <SelectItem value="External">External Service</SelectItem>
                      <SelectItem value="Network">Network Device</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Provider</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digital Ocean, Docker, etc."
                        {...field}
                        value={field.value || ""}
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="port"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Port</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="8080"
                        {...field}
                        value={field.value || ""}
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Location</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="London, UK or localhost"
                      {...field}
                      value={field.value || ""}
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Icon URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://dashboardicons.com/icons/jellyfin.svg"
                      value={field.value || ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-slate-400">
                    Get free icons from <a href="https://dashboardicons.com" target="_blank" className="text-blue-400 hover:text-blue-300">dashboardicons.com</a>
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional description"
                      {...field}
                      rows={3}
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hidden"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value || false}
                      onChange={field.onChange}
                      className="mt-1 h-4 w-4 text-orange-600 border-slate-600 rounded focus:ring-orange-500"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-slate-300">
                      Hidden Service
                    </FormLabel>
                    <p className="text-xs text-slate-400">
                      Hide this service from the main dashboard. Press 'H' to toggle visibility.
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-primary hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                {isSubmitting ? "Updating..." : "Update Service"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}