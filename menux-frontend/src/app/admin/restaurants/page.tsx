// src/app/admin/restaurants/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit, Trash2, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { apiClient, RestaurantResponse } from '@/lib/api-client';

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<RestaurantResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getRestaurants();
      setRestaurants(data.content || []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error("Failed to load restaurants");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRestaurant = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiClient.deleteRestaurant(id);

      toast.success(`${name} has been deleted successfully`);

      fetchRestaurants(); // Refresh the list
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      toast.error("Failed to delete restaurant");
    }
  };

  const filteredRestaurants = restaurants.filter(restaurant =>
    (restaurant.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (restaurant.ownerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (restaurant.ownerEmail || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Restaurant Management</h1>
          <p className="text-gray-600 mt-1">Manage all restaurant tenants and their subscriptions</p>
        </div>
        <Link href="/admin/restaurants/create">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Add Restaurant
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search restaurants, owners, or emails..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={fetchRestaurants} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Restaurants Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              </CardContent>
            </Card>
          ))
        ) : filteredRestaurants.length === 0 ? (
          <Card className="col-span-full text-center py-12">
            <CardContent>
              <div className="text-gray-400 mb-4">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No restaurants found</h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? "Try adjusting your search criteria"
                  : "Get started by creating a new restaurant"
                }
              </p>
              {!searchTerm && (
                <Link href="/admin/restaurants/create">
                  <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white">
                    Add Your First Restaurant
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredRestaurants.map((restaurant) => (
            <Card key={restaurant.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{restaurant.name}</CardTitle>
                    <p className="text-sm text-gray-600">{restaurant.ownerName || '—'}</p>
                    <p className="text-xs text-gray-500">{restaurant.ownerEmail || '—'}</p>
                  </div>
                  {restaurant.logoUrl && (
                    <img 
                      src={restaurant.logoUrl} 
                      alt={`${restaurant.name} logo`}
                      className="w-16 h-16 object-contain rounded-lg border"
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
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
                  <Badge variant="outline">{restaurant.subscription?.name}</Badge>
                </div>
                <div className="flex gap-2 pt-2">
                  <Link href={`/admin/restaurants/${restaurant.id}`}>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </Link>
                  <Link href={`/admin/restaurants/${restaurant.id}/edit`}>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDeleteRestaurant(restaurant.id, restaurant.name)}
                    className="flex-1"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {restaurants.length > 0 && filteredRestaurants.length !== restaurants.length && (
        <div className="text-center text-sm text-gray-500">
          Showing {filteredRestaurants.length} of {restaurants.length} restaurants
        </div>
      )}
    </div>
  );
}
