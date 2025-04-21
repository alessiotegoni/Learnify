import { Button } from "@/components/ui/button";
import { db } from "@/drizzle/db";
import { getProductIdTag } from "@/features/products/db/cache";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import Image from "next/image";
import Link from "next/link";

export default async function ProductPurchaseSuccessPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const product = await getPublicProduct(productId);

  if (!product) return;

  return (
    <div className="container my-6">
      <div className="flex gap-16 items-center justify-between">
        <div className="flex flex-col gap-4 items-start">
          <div className="text-3xl font-semibold">Purchase Successful</div>
          <div className="text-xl">
            Thank you for purchasing {product.name}.
          </div>
          <Button asChild className="text-xl h-auto py-4 px-8 rounded-lg">
            <Link href="/courses">View My Courses</Link>
          </Button>
        </div>
        <div className="relative aspect-video max-w-lg grow">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover rounded-xl"
          />
        </div>
      </div>
    </div>
  );
}

async function getPublicProduct(productId: string) {
  "use cache";
  cacheTag(getProductIdTag(productId));

  return db.query.products.findFirst({
    columns: {
      name: true,
      imageUrl: true,
    },
    where: ({ id, status }, { and, eq }) =>
      and(eq(id, productId), eq(status, "public")),
  });
}
