import { Button } from "@/components/ui/button";
import { db } from "@/drizzle/db";
import {
  courseProduct,
  products as productsTable,
  purchases,
} from "@/drizzle/schema";
import { asc, countDistinct, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import Link from "next/link";
import ProductsTable from "@/features/products/components/ProductsTable";
import { getProductGlobalTag } from "@/features/products/db/cache";
import { Plus } from "lucide-react";
import PageHeader from "@/components/PageHeader";

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

export async function getProducts() {
  "use cache";
  cacheTag(getProductGlobalTag());

  return db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      description: productsTable.description,
      status: productsTable.status,
      priceInDollars: productsTable.priceInDollars,
      imageUrl: productsTable.imageUrl,
      customersCount: countDistinct(purchases),
      coursesCount: countDistinct(courseProduct),
    })
    .from(productsTable)
    .leftJoin(purchases, eq(purchases.productId, productsTable.id))
    .leftJoin(courseProduct, eq(courseProduct.productId, productsTable.id))
    .orderBy(asc(productsTable.name))
    .groupBy(productsTable.id);
}
