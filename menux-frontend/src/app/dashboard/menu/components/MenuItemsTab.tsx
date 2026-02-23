'use client';

import { useState, useEffect } from 'react';
import { useRestaurantSessionStore } from '@/store/useRestaurantSessionStore';
import { apiClient } from '@/lib/api-client';
import { MenuItem, MenuItemCreate, MenuCategory } from '@/types';
import { Plus, Edit, Trash2, Eye, EyeOff, Upload, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'react-hot-toast';

export function MenuItemsTab() {
  const restaurant = useRestaurantSessionStore((s) => s.restaurant);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<MenuItemCreate>({
    categoryId: '',
    name: '',
    description: '',
    price: 0,
    isVeg: true,
    isAvailable: true,
    imageUrl: ''
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const restaurantId = restaurant?.id;

  useEffect(() => {
    if (restaurantId) {
      fetchCategories();
    }
  }, [restaurantId]);

  const fetchCategories = async () => {
    if (!restaurantId) return;
    try {
      const data = await apiClient.getMenuCategories(restaurantId);
      const active = data
        .filter(cat => cat.isActive)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      setCategories(active);
      if (active.length > 0 && !formData.categoryId) {
        setFormData((prev) => ({ ...prev, categoryId: active[0].id }));
      }
      await fetchItems(active);
    } catch (error) {
      toast.error('Failed to fetch categories');
    }
  };

  const fetchItems = async (sourceCategories = categories) => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const categoryIds = sourceCategories.map((cat) => cat.id);
      const itemSets = await Promise.all(
        categoryIds.map((categoryId) =>
          apiClient.getMenuItemsByCategory(restaurantId, categoryId)
        )
      );
      setItems(itemSets.flat());
    } catch (error) {
      toast.error('Failed to fetch menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId) return;

    try {
      if (editingItem) {
        await apiClient.updateMenuItem(restaurantId, editingItem.id, formData);
        toast.success('Menu item updated successfully');
      } else {
        await apiClient.createMenuItem(restaurantId, formData);
        toast.success('Menu item created successfully');
      }
      setIsModalOpen(false);
      setEditingItem(null);
      resetForm();
      fetchItems();
    } catch (error) {
      toast.error(editingItem ? 'Failed to update menu item' : 'Failed to create menu item');
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!restaurantId) return;
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      await apiClient.deleteMenuItem(restaurantId, itemId);
      toast.success('Menu item deleted successfully');
      fetchItems();
    } catch (error) {
      toast.error('Failed to delete menu item');
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    if (!restaurantId) return;

    try {
      await apiClient.updateMenuItemAvailability(restaurantId, item.id, {
        isAvailable: !item.isAvailable
      });
      toast.success(`Menu item ${item.isAvailable ? 'marked as unavailable' : 'marked as available'} successfully`);
      fetchItems();
    } catch (error) {
      toast.error('Failed to update menu item availability');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!restaurantId) return;
    setUploadingImage(true);
    try {
      const response = await apiClient.uploadMenuItemImage(restaurantId, file);
      // Added safety check to ensure response exists before updating state
      if (response && response.image_url) {
        setFormData({ ...formData, imageUrl: response.image_url });
        toast.success('Image uploaded successfully');
      }
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      categoryId: item.categoryId,
      name: item.name,
      description: item.description || '',
      price: item.price,
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
      imageUrl: item.imageUrl || ''
    });
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingItem(null);
    resetForm();
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      categoryId: categories[0]?.id || '',
      name: '',
      description: '',
      price: 0,
      isVeg: true,
      isAvailable: true,
      imageUrl: ''
    });
  };

  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.categoryId === selectedCategory);

  const categoryMap = categories.reduce<Record<string, string>>((acc, cat) => {
    acc[cat.id] = cat.name;
    return acc;
  }, {});

  const selectedCategoryLabel =
    selectedCategory === 'all'
      ? 'All Categories'
      : categoryMap[selectedCategory] || 'Select category';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Menu Items</h2>
          <p className="text-gray-600">Manage your menu items and their details</p>
        </div>
        <Button
          onClick={openCreateModal}
          className="bg-orange-600 hover:bg-orange-700"
          disabled={categories.length === 0}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {categories.length === 0 && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
          Create a menu category first to start adding items.
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Label htmlFor="category-filter">Filter by Category:</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-[220px] justify-between border-gray-300 text-gray-700"
              >
                <span className="truncate">{selectedCategoryLabel}</span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[220px]">
              <DropdownMenuItem onClick={() => setSelectedCategory('all')}>
                All Categories
              </DropdownMenuItem>
              {categories.map((category) => (
                <DropdownMenuItem
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Items List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading menu items...</div>
        ) : filteredItems.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No menu items found. Create your first item to get started.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <span className="text-gray-500 text-sm">No image</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.description || 'No description'}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-600">INR {item.price}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.isVeg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.isVeg ? 'Veg' : 'Non-Veg'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {categoryMap[item.categoryId] || 'Unassigned'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={item.isAvailable}
                      onCheckedChange={() => handleToggleAvailability(item)}
                      aria-label={`Toggle ${item.name} availability`}
                    />
                    {item.isAvailable ? (
                      <Eye className="w-4 h-4 text-green-500" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(item)}
                      className="text-gray-600 hover:text-gray-900 border-gray-300"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
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

      {/* Item Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Menu Item' : 'Create New Menu Item'}
            </DialogTitle>
            <DialogDescription>
              {editingItem 
                ? 'Update the menu item details below.'
                : 'Add a new menu item to your menu.'
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="categoryId">Category</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between border-gray-300 text-gray-700"
                  >
                    <span className="truncate">
                      {categoryMap[formData.categoryId] || 'Select category'}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[320px]">
                  {categories.map((category) => (
                    <DropdownMenuItem
                      key={category.id}
                      onClick={() => setFormData({ ...formData, categoryId: category.id })}
                    >
                      {category.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div>
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Chicken Biryani"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the item"
              />
            </div>
            <div>
              <Label htmlFor="price">Price (INR)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                placeholder="0.00"
                min="0"
                required
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isVeg}
                  onCheckedChange={(checked) => setFormData({ ...formData, isVeg: checked })}
                />
                <Label>Veg</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isAvailable}
                  onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
                />
                <Label>Available</Label>
              </div>
            </div>
            <div>
              <Label htmlFor="image">Image</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="flex-1"
                  disabled={uploadingImage}
                />
                <Upload className="w-5 h-5 text-gray-400" />
              </div>
              {formData.imageUrl && (
  <p className="text-sm text-gray-500 mt-1 break-all">
    Selected: {formData.imageUrl}
  </p>
)}
              {uploadingImage && (
                <p className="text-sm text-gray-500 mt-1">Uploading image...</p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                {editingItem ? 'Update Item' : 'Create Item'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

