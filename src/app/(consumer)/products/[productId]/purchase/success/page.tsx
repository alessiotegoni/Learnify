import { Button } from "@/components/ui/button";
import { db } from "@/drizzle/db";
import { getProductIdTag } from "@/features/products/db/cache";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, PlayCircle } from "lucide-react";

export default async function ProductPurchaseSuccessPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const product = await getPublicProduct(productId);

  if (!product) return null;

  return (
    <div className="container !max-w-4xl">
      <div className="text-center mb-12">
        <div className="rounded-full bg-green-100 p-4 w-20 h-20 mx-auto flex items-center justify-center mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Purchase Successful!</h1>
        <p className="text-xl text-muted-foreground">
          Thank you for purchasing {product.name}. You now have full access to
          this course.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="relative aspect-video rounded-xl overflow-hidden">
          <Image
            src={product.imageUrl || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">{product.name}</h2>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          <div className="space-y-4">
            <Button asChild size="lg" className="w-full gap-2 rounded-full">
              <Link href={`/courses/${product.coursesIds[0]}`}>
                <PlayCircle className="h-5 w-5" />
                Start Learning Now
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full rounded-full"
            >
              <Link href="/#courses">Browse More Courses</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

async function getPublicProduct(productId: string) {
  "use cache";
  cacheTag(getProductIdTag(productId));

  return db.query.products
    .findFirst({
      with: {
        courseProduct: {
          columns: { courseId: true },
        },
      },
      columns: {
        name: true,
        imageUrl: true,
        description: true,
      },
      where: ({ id, status }, { and, eq }) =>
        and(eq(id, productId), eq(status, "public")),
    })
    .then((product) =>
      product
        ? {
            ...product,
            coursesIds: product.courseProduct.map((cp) => cp.courseId),
          }
        : undefined
    );
}
