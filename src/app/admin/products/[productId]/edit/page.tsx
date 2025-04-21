import PageHeader from "@/components/PageHeader";
import { db } from "@/drizzle/db";
import ProductForm from "@/features/products/components/ProductForm";
import { getProductIdTag } from "@/features/products/db/cache";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { getCourses } from "../../new/page";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ productId: string }>;
};

export default async function EditProduct({ params }: Props) {
  const { productId } = await params;

  const [product, courses] = await Promise.all([
    getProduct(productId),
    getCourses(),
  ]);

  if (!product || !courses) notFound();

  return (
    <>
      <PageHeader title="Edit Product" />
      <ProductForm
        courses={courses}
        product={{
          ...product,
          courseIds: product.courseProduct.map(({ courseId }) => courseId),
        }}
      />
    </>
  );
}

export async function getProduct(id: string) {
  "use cache";
  cacheTag(getProductIdTag(id));

  return db.query.products.findFirst({
    where: ({ id: productId }, { eq }) => eq(productId, id),
    columns: {
      createdAt: false,
      updatedAt: false,
    },
    with: {
      courseProduct: {
        columns: {
          courseId: true,
        },
      },
    },
  });
}
