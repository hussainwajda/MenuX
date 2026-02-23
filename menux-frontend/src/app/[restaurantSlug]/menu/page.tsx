// src/app/[restaurantSlug]/menu/page.tsx

import StaticMenu from '@/components/menu/StaticMenu';

export default function ViewMenuPage({ 
  params 
}: { 
  params: { restaurantSlug: string } 
}) {
  // This passes the slug (e.g., 'hotel-balaji') from the URL directly to the component
  return <StaticMenu restaurantSlug={params.restaurantSlug} />;
}