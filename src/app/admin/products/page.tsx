import PageHeader from "@/components/PageHeader";
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

export default async function PageProducts() {
  const products = await getProducts();

  return (
    <>
      <PageHeader title="Products">
        <Button asChild>
          <Link href="/admin/products/new">Create product</Link>
        </Button>
      </PageHeader>
      <ProductsTable products={products} />
    </>
  );
}

export async function getProducts() {
  "use cache";
  cacheTag(getProductGlobalTag());

  console.log("getting products");

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
