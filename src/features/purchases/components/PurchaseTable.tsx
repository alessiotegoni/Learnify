import ActionButton from "@/components/ActionButton";
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
import { formatDate, formatPlural, formatPrice } from "@/lib/formatters";
import { AwaitedReturn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { refundPurchase } from "../actions/purchases";
import { getPurchases } from "../queries/sales/purchases";

type Props = {
  purchases: AwaitedReturn<typeof getPurchases>;
};

export default function PurchaseTable({ purchases }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            {formatPlural(purchases.length, {
              singular: "Sale",
              plural: "Sales",
            })}
          </TableHead>
          <TableHead>Customer Name</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {purchases.map((purchase) => (
          <TableRow key={purchase.id}>
            <TableCell>
              {" "}
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
                  <div className="text-muted-foreground">
                    {formatDate(purchase.createdAt)}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              {purchase.userDetails.fullName || "Anonimous user"}
            </TableCell>
            <TableCell>
              {purchase.refundedAt ? (
                <Badge variant="outline">Refunded</Badge>
              ) : (
                formatPrice(purchase.pricePaidInCents / 100)
              )}
            </TableCell>
            <TableCell className="flex items-center gap-2">
              {!purchase.refundedAt && purchase.pricePaidInCents > 0 && (
                <ActionButton
                  action={refundPurchase.bind(null, purchase.id)}
                  requireAreYouSure
                >
                  Refund
                </ActionButton>
              )}
              <Button variant="outline" asChild>
                <Link href={`/purchases/${purchase.id}`}>Details</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
