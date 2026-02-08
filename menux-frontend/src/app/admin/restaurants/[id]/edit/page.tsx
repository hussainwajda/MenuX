// src/app/admin/restaurants/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Upload, X, Eye, Palette, Type, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { apiClient, SubscriptionDropdownResponse } from '@/lib/api-client';
import Link from 'next/link';

export default function EditRestaurantPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logoUrl: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    subscriptionId: null as number | null,
    themeConfig: {
      primaryColor: '#3b82f6',
      fontFamily: 'Inter'
    },
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [subscriptions, setSubscriptions] = useState<SubscriptionDropdownResponse[]>([]);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch restaurant and subscriptions on mount
  useEffect(() => {
    fetchRestaurant();
    fetchSubscriptions();
  }, [id]);

  const fetchRestaurant = async () => {
    try {
      setInitialLoading(true);
      const restaurant = await apiClient.getRestaurantById(id);
      
      setFormData({
        name: restaurant.name,
        slug: restaurant.slug,
        logoUrl: restaurant.logoUrl || '',
        ownerName: restaurant.ownerName || '',
        ownerEmail: restaurant.ownerEmail || '',
        ownerPhone: restaurant.ownerPhone || '',
        subscriptionId: restaurant.subscription?.id ?? null,
        themeConfig: {
          primaryColor: restaurant.themeConfig?.primaryColor ?? '#3b82f6',
          fontFamily: restaurant.themeConfig?.fontFamily ?? 'Inter'
        },
        isActive: restaurant.isActive,
      });
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      toast.error("Error fetching restaurant");
      router.push('/admin/restaurants');
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const subs = await apiClient.getSubscriptionDropdown();
      setSubscriptions(subs);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error("Error Fetching Subscriptions");
    }
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload a valid image file");
      return;
    }

    setIsUploading(true);
    try {
      const result = await apiClient.uploadRestaurantLogo(file);
      setFormData(prev => ({ ...prev, logoUrl: result.logo_url }));
      toast.success("Logo updated successfully");
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error(`Error uploading logo: ${error}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle form field changes
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug from name
    if (field === 'name') {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleThemeChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      themeConfig: { ...prev.themeConfig, [field]: value }
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Restaurant name is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    if (!formData.ownerName.trim()) newErrors.ownerName = 'Owner name is required';
    if (!formData.ownerEmail.trim()) newErrors.ownerEmail = 'Owner email is required';
    if (!/\S+@\S+\.\S+/.test(formData.ownerEmail)) newErrors.ownerEmail = 'Invalid email format';
    if (!formData.subscriptionId) newErrors.subscriptionId = 'Subscription is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await apiClient.updateRestaurant(id, {
        name: formData.name,
        slug: formData.slug,
        logoUrl: formData.logoUrl,
        subscriptionId: formData.subscriptionId ?? undefined,
        themeConfig: formData.themeConfig,
        isActive: formData.isActive,
      });

      toast.success("Restaurant updated successfully");

      router.push(`/admin/restaurants/${id}`);
    } catch (error) {
      console.error('Error updating restaurant:', error);
      toast.error("Error updating restaurant");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Link href={`/admin/restaurants/${id}`} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Restaurant
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Restaurant</h1>
          <p className="text-gray-600 mt-1">Update restaurant details and configuration</p>
        </div>
        <Link href={`/admin/restaurants/${id}`}>
          <Button variant="outline">View Details</Button>
        </Link>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow-sm border">
        
        {/* Restaurant Information */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Save className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Restaurant Information</h2>
              <p className="text-sm text-gray-600">Basic details about the restaurant</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Restaurant Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Webblers Bistro"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                placeholder="e.g., webblers-bistro"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                className={errors.slug ? 'border-red-500' : ''}
              />
              {errors.slug && <p className="text-red-500 text-sm">{errors.slug}</p>}
              <p className="text-xs text-gray-500">This will be used in the URL</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="logo">Logo Upload</Label>
              <div className="flex items-center gap-4">
                {formData.logoUrl ? (
                  <div className="relative">
                    <img src={formData.logoUrl} alt="Restaurant logo" className="w-16 h-16 object-contain rounded-lg border" />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, logoUrl: '' }))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <Upload className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  {isUploading && <p className="text-xs text-gray-500 mt-1">Uploading...</p>}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="isActive">Is Active</Label>
              <div className="flex items-center gap-3">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
                <span className="text-sm text-gray-600">
                  {formData.isActive ? 'Restaurant is active' : 'Restaurant is inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Owner Information */}
        <div className="space-y-6 border-t pt-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Eye className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Owner / Manager Information</h2>
              <p className="text-sm text-gray-600">Details for the restaurant owner who will manage the account</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="ownerName">Owner Full Name *</Label>
              <Input
                id="ownerName"
                placeholder="e.g., Rohan Sharma"
                value={formData.ownerName}
                onChange={(e) => handleInputChange('ownerName', e.target.value)}
                className={errors.ownerName ? 'border-red-500' : ''}
              />
              {errors.ownerName && <p className="text-red-500 text-sm">{errors.ownerName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerEmail">Owner Email *</Label>
              <Input
                id="ownerEmail"
                type="email"
                placeholder="e.g., rohan@webblers.com"
                value={formData.ownerEmail}
                onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
                className={errors.ownerEmail ? 'border-red-500' : ''}
              />
              {errors.ownerEmail && <p className="text-red-500 text-sm">{errors.ownerEmail}</p>}
              <p className="text-xs text-gray-500">This will be used for login credentials</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="ownerPhone">Owner Phone</Label>
              <Input
                id="ownerPhone"
                placeholder="e.g., +91 98765 43210"
                value={formData.ownerPhone}
                onChange={(e) => handleInputChange('ownerPhone', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subscription">Subscription Plan *</Label>
              <Select
                value={formData.subscriptionId ? String(formData.subscriptionId) : ''}
                onValueChange={(value) => handleInputChange('subscriptionId', Number(value))}
              >
                <SelectTrigger className={errors.subscriptionId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select a subscription plan" />
                </SelectTrigger>
                <SelectContent>
                  {subscriptions.map((subscription) => (
                    <SelectItem key={subscription.id} value={String(subscription.id)}>
                      {subscription.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.subscriptionId && <p className="text-red-500 text-sm">{errors.subscriptionId}</p>}
            </div>
          </div>
        </div>

        {/* Theme Configuration */}
        <div className="space-y-6 border-t pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Palette className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Theme Configuration</h2>
                <p className="text-sm text-gray-600">Optional: Customize the restaurant's theme</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsThemeOpen(!isThemeOpen)}
              className="flex items-center gap-2"
            >
              <Palette className="w-4 h-4" />
              {isThemeOpen ? 'Hide Theme' : 'Show Theme'}
            </Button>
          </div>

          {isThemeOpen && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-4 items-center">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={formData.themeConfig.primaryColor}
                    onChange={(e) => handleThemeChange('primaryColor', e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={formData.themeConfig.primaryColor}
                    onChange={(e) => handleThemeChange('primaryColor', e.target.value)}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fontFamily">Font Family</Label>
                <Select value={formData.themeConfig.fontFamily} onValueChange={(value) => handleThemeChange('fontFamily', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select font family" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                    <SelectItem value="Open Sans">Open Sans</SelectItem>
                    <SelectItem value="Montserrat">Montserrat</SelectItem>
                    <SelectItem value="Poppins">Poppins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Link href={`/admin/restaurants/${id}`}>
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
          <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </>
            ) : (
              'Update Restaurant'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
