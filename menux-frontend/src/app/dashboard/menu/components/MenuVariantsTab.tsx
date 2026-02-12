'use client';

import { useState, useEffect } from 'react';
import { useRestaurantSessionStore } from '@/store/useRestaurantSessionStore';
import { apiClient } from '@/lib/api-client';
import { MenuVariant, MenuVariantCreate, MenuVariantUpdate, MenuItem } from '@/types';
import { Edit, Trash2, PlusCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

export function MenuVariantsTab() {
  const restaurant = useRestaurantSessionStore((s) => s.restaurant);
  const [items, setItems] = useState<(MenuItem & { variants: MenuVariant[]; categoryName?: string })[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<MenuVariant | null>(null);
  const [editingItemId, setEditingItemId] = useState<string>('');
  const [formData, setFormData] = useState<MenuVariantCreate>({
    name: '',
    priceDifference: 0
  });
  const [selectedItem, setSelectedItem] = useState<string>('');

  const restaurantId = restaurant?.id;

  useEffect(() => {
    if (restaurantId) {
      fetchItems();
    }
  }, [restaurantId]);

  const fetchItems = async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const categoryData = await apiClient.getMenuCategories(restaurantId);
      const activeCategories = categoryData.filter((cat) => cat.isActive);
      const itemSets = await Promise.all(
        activeCategories.map((category) =>
          apiClient.getMenuItemsByCategory(restaurantId, category.id)
        )
      );
      const flatItems = itemSets.flat();
      const variantsByItem = await Promise.all(
        flatItems.map(async (item) => {
          const variants = await apiClient.getMenuVariants(restaurantId, item.id);
          return { itemId: item.id, variants };
        })
      );
      const variantsMap = variantsByItem.reduce<Record<string, MenuVariant[]>>((acc, entry) => {
        acc[entry.itemId] = entry.variants;
        return acc;
      }, {});
      const categoryMap = categoryData.reduce<Record<string, string>>((acc, cat) => {
        acc[cat.id] = cat.name;
        return acc;
      }, {});
      setItems(
        flatItems.map((item) => ({
          ...item,
          variants: variantsMap[item.id] ?? [],
          categoryName: categoryMap[item.categoryId],
        }))
      );
      if (!selectedItem && flatItems.length > 0) {
        setSelectedItem(flatItems[0].id);
      }
      if (selectedItem && !flatItems.some((item) => item.id === selectedItem)) {
        setSelectedItem('');
      }
    } catch (error) {
      toast.error('Failed to fetch menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId || !editingItemId) return;

    try {
      if (editingVariant) {
        await apiClient.updateMenuVariant(restaurantId, editingItemId, editingVariant.id, formData);
        toast.success('Variant updated successfully');
      } else {
        await apiClient.createMenuVariant(restaurantId, editingItemId, formData);
        toast.success('Variant created successfully');
      }
      setIsModalOpen(false);
      setEditingVariant(null);
      setEditingItemId('');
      resetForm();
      fetchItems();
    } catch (error) {
      toast.error(editingVariant ? 'Failed to update variant' : 'Failed to create variant');
    }
  };

  const handleDelete = async (itemId: string, variantId: string) => {
    if (!restaurantId) return;
    if (!confirm('Are you sure you want to delete this variant?')) return;

    try {
      await apiClient.deleteMenuVariant(restaurantId, itemId, variantId);
      toast.success('Variant deleted successfully');
      fetchItems();
    } catch (error) {
      toast.error('Failed to delete variant');
    }
  };

  const openEditModal = (item: MenuItem, variant: MenuVariant) => {
    setEditingVariant(variant);
    setEditingItemId(item.id);
    setFormData({
      name: variant.name,
      priceDifference: variant.priceDifference
    });
    setIsModalOpen(true);
  };

  const openCreateModal = (itemId: string) => {
    setEditingVariant(null);
    setEditingItemId(itemId);
    resetForm();
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      priceDifference: 0
    });
  };

  const selectedItemData = items.find(item => item.id === selectedItem);
  const selectedItemLabel = selectedItemData
    ? `${selectedItemData.name} - INR ${selectedItemData.price} (${selectedItemData.categoryName || 'Unassigned'})`
    : 'Select a menu item';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Menu Variants</h2>
          <p className="text-gray-600">Manage variants for your menu items (e.g., Half, Full, Regular, Large)</p>
        </div>
      </div>

      {/* Select Item */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="item-select">Select Item:</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[340px] justify-between border-gray-300 text-gray-700"
                >
                  <span className="truncate">{selectedItemLabel}</span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[340px]">
                {items.map((item) => (
                  <DropdownMenuItem key={item.id} onClick={() => setSelectedItem(item.id)}>
                    {item.name} - INR {item.price} ({item.categoryName || 'Unassigned'})
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {selectedItem && (
            <Button 
              onClick={() => openCreateModal(selectedItem)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Variant
            </Button>
          )}
        </div>
      </div>

      {/* Variants List */}
      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-500">
          Loading menu items...
        </div>
      ) : selectedItem && selectedItemData ? (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">
              Variants for: {selectedItemData.name}
            </h3>
            <p className="text-sm text-gray-500">
              Base Price: INR {selectedItemData.price}
            </p>
          </div>
          
          {selectedItemData.variants.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No variants found for this item. Add your first variant to get started.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {selectedItemData.variants.map((variant) => (
                <div key={variant.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{variant.name}</h4>
                      <p className="text-sm text-gray-500">
                        Price: INR {selectedItemData.price + variant.priceDifference} 
                        ({variant.priceDifference > 0 ? '+' : ''}INR {variant.priceDifference})
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(selectedItemData, variant)}
                        className="text-gray-600 hover:text-gray-900 border-gray-300"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(selectedItemData.id, variant.id)}
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
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-500">
          Select a menu item to view and manage its variants.
        </div>
      )}

      {/* Variant Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingVariant ? 'Edit Variant' : 'Create New Variant'}
            </DialogTitle>
            <DialogDescription>
              {editingVariant 
                ? 'Update the variant details below.'
                : 'Add a new variant to your menu item.'
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Variant Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Half, Full, Regular, Large"
                required
              />
            </div>
            <div>
              <Label htmlFor="priceDifference">Price Difference (INR)</Label>
              <Input
                id="priceDifference"
                type="number"
                step="0.01"
                value={formData.priceDifference}
                onChange={(e) => setFormData({ ...formData, priceDifference: parseFloat(e.target.value) })}
                placeholder="0.00"
                min="0"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                This will be added to the base price of INR {selectedItemData?.price || 0}
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                {editingVariant ? 'Update Variant' : 'Create Variant'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

