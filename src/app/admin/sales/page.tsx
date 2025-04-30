import PageHeader from "@/components/PageHeader";
import { db } from "@/drizzle/db";
import PurchaseTable from "@/features/purchases/components/PurchaseTable";
import { getPurchaseGlobalTag } from "@/features/purchases/db/cache";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

export default async function SalesPage() {
  const purchases = await getPurchases();

  return (
    <>
      <PageHeader
        title="Sales"
        description="View and manage all sales transactions on your platform."
      />
      <div className="rounded-xl border overflow-hidden bg-card">
        <PurchaseTable purchases={purchases} />
      </div>
    </>
  );
}

export async function getPurchases() {
  "use cache";
  cacheTag(getPurchaseGlobalTag());

  return db.query.purchases.findMany({
    columns: {
      id: true,
      clerkUserId: true,
      pricePaidInCents: true,
      refundedAt: true,
      userDetails: true,
      productDetails: true,
      createdAt: true,
    },
    orderBy: ({ createdAt }, { desc }) => desc(createdAt),
  });
}
