// src/app/admin/restaurants/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Eye, CheckCircle, XCircle, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { apiClient, RestaurantResponse } from '@/lib/api-client';

export default function RestaurantDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [restaurant, setRestaurant] = useState<RestaurantResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchRestaurant();
  }, [id]);

  const fetchRestaurant = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getRestaurantById(id);
      setRestaurant(data);
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      toast.error("Failed to load restaurant details");
      router.push('/admin/restaurants');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRestaurant = async () => {
    if (!confirm(`Are you sure you want to delete ${restaurant?.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(true);
      await apiClient.deleteRestaurant(id);

      toast.success(`${restaurant?.name} has been deleted successfully`);

      router.push('/admin/restaurants');
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      toast.error("Failed to delete restaurant");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Restaurant Not Found</h2>
        <p className="text-gray-600 mb-8">The restaurant you're looking for doesn't exist or has been deleted.</p>
        <Link href="/admin/restaurants">
          <Button>Back to Restaurants</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Link href="/admin/restaurants" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Restaurants
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
          <p className="text-gray-600 mt-1">Restaurant Details</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/restaurants/${id}/edit`}>
            <Button variant="outline" className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Edit
            </Button>
          </Link>
          <Button 
            variant="destructive" 
            onClick={handleDeleteRestaurant}
            disabled={deleting}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      {/* Restaurant Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Logo and Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Logo */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Logo</h3>
            {restaurant.logoUrl ? (
              <div className="space-y-4">
                <img 
                  src={restaurant.logoUrl} 
                  alt={`${restaurant.name} logo`}
                  className="w-full h-48 object-contain rounded-lg border"
                />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Replace
                  </Button>
                </div>
              </div>
            ) : (
              <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Eye className="w-12 h-12 mx-auto mb-2" />
                  <p>No logo uploaded</p>
                </div>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
            <div className="flex items-center gap-3">
              <Badge variant={restaurant.isActive ? "default" : "secondary"}>
                {restaurant.isActive ? (
                  <>
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Active
                  </>
                ) : (
                  <>
                    <XCircle className="mr-1 h-3 w-3" />
                    Inactive
                  </>
                )}
              </Badge>
              <span className="text-sm text-gray-600">
                {restaurant.isActive ? 'Restaurant is accepting orders' : 'Restaurant is not accepting orders'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Restaurant Name</label>
                <p className="mt-1 text-gray-900">{restaurant.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Slug</label>
                <p className="mt-1 text-gray-900">{restaurant.slug}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Subscription</label>
                <Badge variant="outline" className="mt-1">{restaurant.subscription?.name}</Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Owner Phone</label>
                <p className="mt-1 text-gray-900">{restaurant.ownerPhone || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Owner Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Owner / Manager Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Owner Name</label>
                <p className="mt-1 text-gray-900">{restaurant.ownerName || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Owner Email</label>
                <p className="mt-1 text-gray-900">{restaurant.ownerEmail || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Theme Configuration */}
          {restaurant.themeConfig && (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Theme Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Primary Color</label>
                  <div className="mt-1 flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: restaurant.themeConfig.primaryColor }}
                    ></div>
                    <span className="text-gray-900">{restaurant.themeConfig.primaryColor}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Font Family</label>
                  <p className="mt-1 text-gray-900" style={{ fontFamily: restaurant.themeConfig.fontFamily }}>
                    {restaurant.themeConfig.fontFamily}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
