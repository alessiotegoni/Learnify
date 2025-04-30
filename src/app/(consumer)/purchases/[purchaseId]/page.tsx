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
import { currentUser } from "@clerk/nextjs/server";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { ExternalLink, FileText, Loader2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";

type Props = {
  params: Promise<{ purchaseId: string }>;
};

export default async function PurchasePage({ params }: Props) {
  const { purchaseId } = await params;

  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center py-20 mt-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      }
    >
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
    <div className="container !max-w-3xl">
      <PageHeader title="Purchase Receipt">
        {receiptUrl && (
          <Button asChild variant="outline" className="gap-1.5 rounded-full">
            <Link target="_blank" href={receiptUrl}>
              <FileText className="h-4 w-4" />
              View Original Receipt
              <ExternalLink className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        )}
      </PageHeader>

      <Card className="overflow-hidden">
        <CardHeader className="pb-6 border-b">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <CardTitle className="text-2xl">
                {purchase.productDetails.name}
              </CardTitle>
              <CardDescription>Receipt ID: {purchaseId}</CardDescription>
            </div>
            <Badge
              className={cn(
                "px-3 py-1 text-sm font-medium",
                purchase.refundedAt
                  ? "bg-yellow-100 text-yellow-800 border border-yellow-300 hover:bg-yellow-100 hover:text-yellow-800"
                  : "bg-green-100 text-green-800 border border-green-300 hover:bg-green-100 hover:text-green-800"
              )}
            >
              {purchase.refundedAt ? "Refunded" : "Paid"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Date</p>
            <p className="font-medium">{formatDate(purchase.createdAt)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Product</p>
            <p className="font-medium">{purchase.productDetails.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Customer</p>
            <p className="font-medium">{user.fullName}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Seller</p>
            <p className="font-medium">Learnify</p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col border-t pt-6">
          <div className="w-full space-y-3">
            {pricingRows.map(({ label, amountInDollars, isBold }) => (
              <div key={label} className="flex justify-between items-center">
                <span className={cn(isBold && "font-bold")}>{label}</span>
                <span className={cn("font-mono", isBold && "font-bold")}>
                  {formatPrice(amountInDollars, { showZeroAsNumber: true })}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-8">
            <Button asChild className="rounded-full">
              <Link href="/courses">Go to My Courses</Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
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
