// src/app/[restaurantSlug]/menu/page.tsx

import StaticMenu from '@/components/menu/StaticMenu';

export default async function ViewMenuPage({ 
  params 
}: { 
  params: Promise<{ restaurantSlug: string }> 
}) {
  const resolvedParams = await params;
  // This passes the slug (e.g., 'hotel-balaji') from the URL directly to the component
  return <StaticMenu restaurantSlug={resolvedParams.restaurantSlug} />;
}
