import { Button } from "@/components/ui/button";

import Link from "next/link";
import ProductsTable from "@/features/products/components/ProductsTable";
import { Plus } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { getProducts } from "@/features/products/queries/products";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <>
      <PageHeader
        title="Products"
        description="Manage your products and their associated courses."
      >
        <Button asChild className="gap-1.5 rounded-full">
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" />
            Create Product
          </Link>
        </Button>
      </PageHeader>
      <div className="rounded-xl border overflow-hidden bg-card">
        <ProductsTable products={products} />
      </div>
    </>
  );
}
