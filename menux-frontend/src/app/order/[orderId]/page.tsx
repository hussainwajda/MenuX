import PublicOrderSuccessPage from "@/components/menu/PublicOrderSuccessPage";

export default async function OrderSuccessRoute({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  return <PublicOrderSuccessPage orderId={orderId} />;
}
