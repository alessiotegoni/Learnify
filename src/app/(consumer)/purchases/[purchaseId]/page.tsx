import LoadingSpinner from "@/components/LoadingSpinner";
import PageHeader from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { getPurchaseIdTag } from "@/features/purchases/db/cache";
import { formatDate, formatPrice } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { getPurchaseDetails } from "@/services/stripe/actions/stripe";
import { auth, currentUser } from "@clerk/nextjs/server";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Fragment, Suspense } from "react";

type Props = {
  params: Promise<{ purchaseId: string }>;
};

export default async function PurchasePage({ params }: Props) {
  const { purchaseId } = await params;

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SuspenseBoundary purchaseId={purchaseId} />
    </Suspense>
  );
}

async function SuspenseBoundary({ purchaseId }: { purchaseId: string }) {
  const user = await currentUser();
  if (!user) return redirect("/sign-in");

  const purchase = await getPurchase(user.id, purchaseId);
  if (!purchase) return notFound();

  const { receiptUrl, pricingRows } = await getPurchaseDetails(
    purchase.stripeSessionId,
    purchase.pricePaidInCents,
    !!purchase.refundedAt
  );

  return (
    <>
      <PageHeader title={purchase.productDetails.name}>
        {receiptUrl && (
          <Button asChild>
            <Link target="_blank" href={receiptUrl}>
              View Receipt
            </Link>
          </Button>
        )}
      </PageHeader>

      <Card className="gap-0">
        <CardHeader className="block">
          <div className="flex justify-between items-start gap-4 pb-4">
            <div className="flex flex-col gap-2">
              <CardTitle>Receipt</CardTitle>
              <CardDescription>ID: {purchaseId}</CardDescription>
            </div>
            <Badge className="text-base">
              {purchase.refundedAt ? "Refunded" : "Paid"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-8 border-t py-4">
          <div>
            <label className="text-sm text-muted-foreground">Date</label>
            <div>{formatDate(purchase.createdAt)}</div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Product</label>
            <div>{purchase.productDetails.name}</div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Customer</label>
            <div>{user.fullName}</div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Seller</label>
            <div>Course platform</div>
          </div>
        </CardContent>
        <CardFooter className="grid grid-cols-2 gap-y-4 gap-x-8 border-t">
          {pricingRows.map(({ label, amountInDollars, isBold }) => (
            <Fragment key={label}>
              <div className={cn(isBold && "font-bold")}>{label}</div>
              <div className={cn("justify-self-end", isBold && "font-bold")}>
                {formatPrice(amountInDollars, { showZeroAsNumber: true })}
              </div>
            </Fragment>
          ))}
        </CardFooter>
      </Card>
    </>
  );
}

async function getPurchase(userId: string, purchaseId: string) {
  "use cache";
  cacheTag(getPurchaseIdTag(purchaseId));

  return db.query.purchases.findFirst({
    columns: {
      pricePaidInCents: true,
      refundedAt: true,
      productDetails: true,
      createdAt: true,
      stripeSessionId: true,
    },
    where: ({ id, clerkUserId }, { and, eq }) =>
      and(eq(id, purchaseId), eq(clerkUserId, userId)),
  });
}
