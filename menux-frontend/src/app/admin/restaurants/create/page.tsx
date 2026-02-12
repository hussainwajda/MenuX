// src/app/admin/restaurants/create/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Upload, X, Eye, Palette, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { apiClient, SubscriptionDropdownResponse } from '@/lib/api-client';
import Link from 'next/link';

export default function AddRestaurantPage() {
  const router = useRouter();
  
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
    ownerPassword: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [subscriptions, setSubscriptions] = useState<SubscriptionDropdownResponse[]>([]);
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  // Fetch subscriptions on mount
  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const data = await apiClient.getSubscriptionDropdown();
      setSubscriptions(data);
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, subscriptionId: data[0].id }));
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error("Failed to load subscriptions");
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
    const formData = new FormData();
    formData.append('file', file);

    try {
      const data = await apiClient.uploadRestaurantLogo(file);
      setFormData(prev => ({ ...prev, logoUrl: data.logo_url }));
      toast.success("Logo uploaded successfully");
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error("Failed to upload logo");
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
    if (!formData.ownerPassword) newErrors.ownerPassword = 'Owner password is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await apiClient.createRestaurant({
        name: formData.name,
        slug: formData.slug,
        logoUrl: formData.logoUrl || undefined,
        ownerName: formData.ownerName,
        ownerEmail: formData.ownerEmail,
        ownerPhone: formData.ownerPhone || undefined,
        subscriptionId: formData.subscriptionId as number,
        themeConfig: formData.themeConfig,
        isActive: formData.isActive,
        ownerPassword: formData.ownerPassword
      });
      toast.success(`${formData.name} has been created successfully`);

      router.push('/admin/restaurants');
    } catch (error) {
      console.error('Error creating restaurant:', error);
      toast.error(error instanceof Error ? error.message : "Failed to create restaurant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Restaurant</h1>
          <p className="text-gray-600 mt-1">Create a new restaurant tenant and configure their account</p>
        </div>
        <Link href="/admin/restaurants">
          <Button variant="outline">Back to List</Button>
        </Link>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow-sm border">
        
        {/* Restaurant Information */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Plus className="w-4 h-4 text-indigo-600" />
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
              <Label htmlFor="ownerPassword">Owner Password *</Label>
              <Input
                id="ownerPassword"
                type="password"
                placeholder="Enter a secure password"
                value={formData.ownerPassword}
                onChange={(e) => handleInputChange('ownerPassword', e.target.value)}
                className={errors.ownerPassword ? 'border-red-500' : ''}
              />
              {errors.ownerPassword && <p className="text-red-500 text-sm">{errors.ownerPassword}</p>}
            </div>
          </div>
        </div>

        {/* Subscription Selection */}
        <div className="space-y-6 border-t pt-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Eye className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Subscription Selection</h2>
              <p className="text-sm text-gray-600">Choose the subscription plan for this restaurant</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subscription">Subscription Plan *</Label>
            <select
              id="subscription"
              value={formData.subscriptionId ? String(formData.subscriptionId) : ''}
              onChange={(e) => handleInputChange('subscriptionId', Number(e.target.value))}
              className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.subscriptionId ? 'border-red-500' : ''}`}
            >
              <option value="" disabled>
                Select a subscription plan
              </option>
              {subscriptions.map((subscription) => (
                <option key={subscription.id} value={String(subscription.id)}>
                  {subscription.name}
                </option>
              ))}
            </select>
            {errors.subscriptionId && <p className="text-red-500 text-sm">{errors.subscriptionId}</p>}
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
          <Link href="/admin/restaurants">
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
          <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              'Create Restaurant'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
