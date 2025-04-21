import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { db } from "@/drizzle/db";
import UserPurchaseTable, { UserPurchaseTableSkeleton } from "@/features/purchases/components/UserPurchaseTable";
import { getPurchaseGlobalTag } from "@/features/purchases/db/cache";
import { auth } from "@clerk/nextjs/server";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import Link from "next/link";
import { Suspense } from "react";

export default function PurchasesPage() {
  return (
    <>
      <PageHeader title="Purchase history" />
      <Suspense fallback={<UserPurchaseTableSkeleton />}>
        <SuspenseBoundary />
      </Suspense>
    </>
  );
}

async function SuspenseBoundary() {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) return redirectToSignIn();

  const purchases = await getPurchases(userId);

  if (!purchases.length)
    return (
      <div className="flex flex-col items-start">
        You have made no purchases yet
        <Button asChild>
          <Link href="/">Browse courses</Link>
        </Button>
      </div>
    );

  return <UserPurchaseTable purchases={purchases} />;
}

export async function getPurchases(userId: string) {
  "use cache";
  cacheTag(getPurchaseGlobalTag());

  return db.query.purchases.findMany({
    columns: {
      id: true,
      pricePaidInCents: true,
      productDetails: true,
      refundedAt: true,
      createdAt: true,
    },
    where: ({ clerkUserId }, { eq }) => eq(clerkUserId, userId),
    orderBy: ({ createdAt }, { desc }) => desc(createdAt),
  });
}
