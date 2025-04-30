import PageHeader from "@/components/PageHeader";
import PurchaseTable from "@/features/purchases/components/PurchaseTable";
import { getPurchases } from "@/features/purchases/queries/sales/purchases";

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
