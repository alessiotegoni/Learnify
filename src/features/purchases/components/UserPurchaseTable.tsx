import {
  SkeletonArray,
  SkeletonButton,
  SkeletonText,
} from "@/components/Skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatPrice } from "@/lib/formatters";
import { AwaitedReturn } from "@/lib/utils";
import { Receipt } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getPurchases } from "../queries/purchases";

type Props = {
  purchases: AwaitedReturn<typeof getPurchases>;
};

export default function UserPurchaseTable({ purchases }: Props) {
  return (
    <div className="rounded-xl border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchases.map((purchase) => (
            <TableRow key={purchase.id}>
              <TableCell>
                <div className="flex items-center gap-4">
                  <Image
                    className="object-cover rounded-md size-12"
                    src={purchase.productDetails.imageUrl}
                    alt={purchase.productDetails.name}
                    width={192}
                    height={192}
                  />
                  <div className="flex flex-col gap-1">
                    <div className="font-semibold">
                      {purchase.productDetails.name}
                    </div>
                    <div className="text-muted-foreground truncate max-w-[100px]">
                      {purchase.productDetails.description}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {formatPrice(purchase.pricePaidInCents / 100)}
              </TableCell>
              <TableCell>
                {purchase.refundedAt ? (
                  <Badge
                    variant="outline"
                    className="text-yellow-600 border-yellow-600"
                  >
                    Refunded
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-600"
                  >
                    Paid
                  </Badge>
                )}
              </TableCell>
              <TableCell className="font-medium">
                {formatDate(purchase.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                <Button asChild size="sm" variant="ghost" className="gap-1.5">
                  <Link href={`/purchases/${purchase.id}`}>
                    <Receipt className="h-4 w-4" />
                    View Receipt
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function UserPurchaseTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <SkeletonArray amount={3}>
          <TableRow>
            <TableCell>
              <div className="flex items-center gap-4">
                <div className="size-12 bg-secondary animate-pulse rounded-md" />
                <div className="flex flex-col gap-1">
                  <SkeletonText className="w-36" />
                  <SkeletonText className="w-3/4" />
                </div>
              </div>
            </TableCell>
            <TableCell>
              <SkeletonText className="w-12" />
            </TableCell>
            <TableCell>
              <SkeletonButton />
            </TableCell>
          </TableRow>
        </SkeletonArray>
      </TableBody>
    </Table>
  );
}
