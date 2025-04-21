import { db } from "@/drizzle/db";
import ProductCard from "@/features/products/components/ProductCard";
import { getProductGlobalTag } from "@/features/products/db/cache";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

export default async function HomePage() {
  const products = await getPublicProducts();

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(300,1fr))] gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  );
}

export async function getPublicProducts() {
  "use cache";
  cacheTag(getProductGlobalTag());

  return db.query.products.findMany({
    columns: {
      id: true,
      name: true,
      description: true,
      priceInDollars: true,
      imageUrl: true,
    },
    where: ({ status }, { eq }) => eq(status, "public"),
    orderBy: ({ createdAt }, { asc }) => asc(createdAt),
  });
}
