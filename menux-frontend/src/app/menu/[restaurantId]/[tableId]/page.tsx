// src/app/menu/[restaurantId]/[tableId]/page.tsx
import CustomerMenuPage from "@/components/menu/CustomerMenuPage";

export default async function MenuPage({
  params,
}: {
  params: Promise<{ restaurantId: string; tableId: string }>;
}) {
  const resolvedParams = await params;
  // Legacy route kept for compatibility; expects slug-like restaurantId.
  return (
    <CustomerMenuPage
      restaurantSlug={resolvedParams.restaurantId}
      context="table"
      targetId={resolvedParams.tableId}
    />
  );
}
