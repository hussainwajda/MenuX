// src/app/[restaurantSlug]/menu/room/[roomId]/page.tsx
import CustomerMenuPage from "@/components/menu/CustomerMenuPage";
import StaticMenu from "@/components/menu/StaticMenu";

export default async function MenuByRoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ restaurantSlug: string; roomId: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  if (resolvedSearchParams.view !== "order") {
    return (
      <StaticMenu
        restaurantSlug={resolvedParams.restaurantSlug}
        orderButtonHref={`/${resolvedParams.restaurantSlug}/menu/room/${resolvedParams.roomId}?view=order`}
        orderButtonLabel="Start Ordering"
      />
    );
  }

  return (
    <CustomerMenuPage
      restaurantSlug={resolvedParams.restaurantSlug}
      context="room"
      targetId={resolvedParams.roomId}
    />
  );
}
