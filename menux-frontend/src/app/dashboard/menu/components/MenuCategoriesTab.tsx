'use client';

import { useState, useEffect } from 'react';
import { useRestaurantSessionStore } from '@/store/useRestaurantSessionStore';
import { apiClient } from '@/lib/api-client';
import { MenuCategory, MenuCategoryCreate, MenuCategoryUpdate } from '@/types';
import { Plus, Edit, Trash2, GripVertical, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import toast from 'react-hot-toast';

export function MenuCategoriesTab() {
  const restaurant = useRestaurantSessionStore((s) => s.restaurant);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [formData, setFormData] = useState<MenuCategoryCreate>({
    name: '',
    sortOrder: 0,
    isActive: true
  });

  const restaurantId = restaurant?.id;

  useEffect(() => {
    if (restaurantId) {
      fetchCategories();
    }
  }, [restaurantId]);

  const fetchCategories = async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const data = await apiClient.getMenuCategories(restaurantId);
      setCategories(
        data.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      );
    } catch (error) {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId) return;

    try {
      if (editingCategory) {
        await apiClient.updateMenuCategory(restaurantId, editingCategory.id, formData);
        toast.success('Category updated successfully');
      } else {
        await apiClient.createMenuCategory(restaurantId, formData);
        toast.success('Category created successfully');
      }
      setIsModalOpen(false);
      setEditingCategory(null);
      setFormData({ name: '', sortOrder: 0, isActive: true });
      fetchCategories();
    } catch (error) {
      toast.error(editingCategory ? 'Failed to update category' : 'Failed to create category');
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!restaurantId) return;
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await apiClient.deleteMenuCategory(restaurantId, categoryId);
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const handleToggleActive = async (category: MenuCategory) => {
    if (!restaurantId) return;

    try {
      await apiClient.updateMenuCategory(restaurantId, category.id, {
        isActive: !category.isActive
      });
      toast.success(`Category ${category.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchCategories();
    } catch (error) {
      toast.error('Failed to update category status');
    }
  };

  const openEditModal = (category: MenuCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      sortOrder: category.sortOrder ?? undefined,
      isActive: category.isActive
    });
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', sortOrder: categories.length, isActive: true });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Menu Categories</h2>
          <p className="text-gray-600">Manage your menu categories and their order</p>
        </div>
        <Button onClick={openCreateModal} className="bg-orange-600 hover:bg-orange-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No categories found. Create your first category to get started.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {categories.map((category, index) => (
              <div key={category.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <GripVertical className="w-5 h-5 text-gray-400" />
                    <div>
                      <h3 className="font-medium text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-500">Order: {category.sortOrder ?? 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={category.isActive}
                      onCheckedChange={() => handleToggleActive(category)}
                      aria-label={`Toggle ${category.name} active status`}
                    />
                    {category.isActive ? (
                      <Eye className="w-4 h-4 text-green-500" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(category)}
                      className="text-gray-600 hover:text-gray-900 border-gray-300"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-900 border-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory 
                ? 'Update the category details below.'
                : 'Add a new category to organize your menu items.'
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Starters, Main Course, Desserts"
                required
              />
            </div>
            <div>
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                placeholder="0"
                min="0"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label>Active</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                {editingCategory ? 'Update Category' : 'Create Category'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
