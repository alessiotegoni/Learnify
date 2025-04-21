import PageHeader from "@/components/PageHeader";
import { db } from "@/drizzle/db";
import PurchaseTable from "@/features/purchases/components/PurchaseTable";
import { getPurchaseGlobalTag } from "@/features/purchases/db/cache";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

export default async function PurchasesPage() {
  const purchases = await getPurchases();

  return (
    <>
      <PageHeader title="Sales" />
      <PurchaseTable purchases={purchases} />
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
