import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Category, InsertCategory, UpdateCategory } from "@shared/schema";

interface CategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EditingCategory {
  id?: number;
  name: string;
  description: string;
  color: string;
}

export default function CategoryManagementModal({ isOpen, onClose }: CategoryManagementModalProps) {
  const [editingCategory, setEditingCategory] = useState<EditingCategory | null>(null);
  const [newCategory, setNewCategory] = useState<EditingCategory>({
    name: "",
    description: "",
    color: "#3B82F6"
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["/api/categories"],
    enabled: isOpen,
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: InsertCategory) => {
      const response = await apiRequest("POST", "/api/categories", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setNewCategory({ name: "", description: "", color: "#3B82F6" });
      toast({
        title: "Category created",
        description: "Your new category has been successfully created.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create category.",
        variant: "destructive",
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateCategory }) => {
      const response = await apiRequest("PUT", `/api/categories/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setEditingCategory(null);
      toast({
        title: "Category updated",
        description: "Category has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update category.",
        variant: "destructive",
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Category deleted",
        description: "Category has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete category.",
        variant: "destructive",
      });
    },
  });

  const handleCreateCategory = () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required.",
        variant: "destructive",
      });
      return;
    }
    createCategoryMutation.mutate(newCategory);
  };

  const handleUpdateCategory = () => {
    if (!editingCategory || !editingCategory.name.trim()) return;
    
    updateCategoryMutation.mutate({
      id: editingCategory.id!,
      data: {
        name: editingCategory.name,
        description: editingCategory.description || null,
        color: editingCategory.color,
      },
    });
  };

  const handleDeleteCategory = (id: number) => {
    if (confirm("Are you sure you want to delete this category?")) {
      deleteCategoryMutation.mutate(id);
    }
  };

  const startEditing = (category: Category) => {
    setEditingCategory({
      id: category.id,
      name: category.name,
      description: category.description || "",
      color: category.color || "#3B82F6",
    });
  };

  const colors = [
    "#3B82F6", // Blue
    "#10B981", // Green
    "#F59E0B", // Yellow
    "#EF4444", // Red
    "#8B5CF6", // Purple
    "#F97316", // Orange
    "#06B6D4", // Cyan
    "#84CC16", // Lime
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Category */}
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <h3 className="text-lg font-medium mb-4">Add New Category</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-slate-300">Name</Label>
                  <Input
                    id="name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="Category name"
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="text-slate-300">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    placeholder="Category description"
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Color</Label>
                  <div className="flex space-x-2 mt-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewCategory({ ...newCategory, color })}
                        className={`w-6 h-6 rounded-full border-2 ${
                          newCategory.color === color ? "border-white" : "border-slate-600"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <Button
                  onClick={handleCreateCategory}
                  disabled={createCategoryMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {createCategoryMutation.isPending ? "Creating..." : "Add Category"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Existing Categories */}
          <div>
            <h3 className="text-lg font-medium mb-4">Existing Categories</h3>
            {isLoading ? (
              <div className="text-slate-400">Loading categories...</div>
            ) : (
              <div className="space-y-3">
                {categories.map((category: Category) => (
                  <Card key={category.id} className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      {editingCategory?.id === category.id ? (
                        <div className="space-y-4">
                          <div>
                            <Label className="text-slate-300">Name</Label>
                            <Input
                              value={editingCategory.name}
                              onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                              className="bg-slate-800 border-slate-600 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-slate-300">Description</Label>
                            <Input
                              value={editingCategory.description}
                              onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                              className="bg-slate-800 border-slate-600 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-slate-300">Color</Label>
                            <div className="flex space-x-2 mt-2">
                              {colors.map((color) => (
                                <button
                                  key={color}
                                  onClick={() => setEditingCategory({ ...editingCategory, color })}
                                  className={`w-6 h-6 rounded-full border-2 ${
                                    editingCategory.color === color ? "border-white" : "border-slate-600"
                                  }`}
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              onClick={handleUpdateCategory}
                              disabled={updateCategoryMutation.isPending}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Save className="w-4 h-4 mr-1" />
                              Save
                            </Button>
                            <Button
                              onClick={() => setEditingCategory(null)}
                              variant="outline"
                              size="sm"
                              className="border-slate-600 text-slate-300"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: category.color || "#3B82F6" }}
                            />
                            <div>
                              <h4 className="font-medium">{category.name}</h4>
                              {category.description && (
                                <p className="text-sm text-slate-400">{category.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => startEditing(category)}
                              variant="outline"
                              size="sm"
                              className="border-slate-600 text-slate-300"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteCategory(category.id)}
                              variant="outline"
                              size="sm"
                              className="border-red-600 text-red-400 hover:bg-red-600"
                              disabled={deleteCategoryMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}