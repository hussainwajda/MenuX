// src/app/[restaurantSlug]/menu/table/[tableId]/page.tsx
import CustomerMenuPage from "@/components/menu/CustomerMenuPage";
import StaticMenu from "@/components/menu/StaticMenu";

export default async function MenuByTablePage({
  params,
  searchParams,
}: {
  params: Promise<{ restaurantSlug: string; tableId: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  if (resolvedSearchParams.view !== "order") {
    return (
      <StaticMenu
        restaurantSlug={resolvedParams.restaurantSlug}
        orderButtonHref={`/${resolvedParams.restaurantSlug}/menu/table/${resolvedParams.tableId}?view=order`}
        orderButtonLabel="Start Ordering"
      />
    );
  }

  return (
    <CustomerMenuPage
      restaurantSlug={resolvedParams.restaurantSlug}
      context="table"
      targetId={resolvedParams.tableId}
    />
  );
}
