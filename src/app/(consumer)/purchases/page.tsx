import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import UserPurchaseTable, {
  UserPurchaseTableSkeleton,
} from "@/features/purchases/components/UserPurchaseTable";
import { getPurchases } from "@/features/purchases/queries/purchases";
import { auth } from "@clerk/nextjs/server";
import { ShoppingCart } from "lucide-react";
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
