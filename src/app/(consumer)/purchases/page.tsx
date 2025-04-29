import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { db } from "@/drizzle/db";
import UserPurchaseTable, {
  UserPurchaseTableSkeleton,
} from "@/features/purchases/components/UserPurchaseTable";
import { getPurchaseGlobalTag } from "@/features/purchases/db/cache";
import { auth } from "@clerk/nextjs/server";
import { ShoppingCart } from "lucide-react";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import Link from "next/link";
import { Suspense } from "react";

export default function PurchasesPage() {
  return (
    <div className="container">
      <PageHeader title="Purchase history" />
      <Suspense fallback={<UserPurchaseTableSkeleton />}>
        <SuspenseBoundary />
      </Suspense>
    </div>
  );
}

async function SuspenseBoundary() {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();

  const purchases = await getPurchases(userId);

  if (!purchases.length)
    return (
      <div className="flex flex-col items-center text-center py-16">
        <div className="rounded-full bg-primary/10 p-4 mb-4">
          <ShoppingCart className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Purchase History</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          You haven't made any purchases yet. Browse our catalog to find courses
          that interest you.
        </p>
        <Button asChild size="lg" className="rounded-full">
          <Link href="/">Browse Courses</Link>
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
