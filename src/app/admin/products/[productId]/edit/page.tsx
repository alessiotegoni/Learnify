import { Card, CardContent } from "@/components/ui/card";
import ProductForm from "@/features/products/components/ProductForm";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { getProductAvaiableCourses } from "@/features/courses/queries/courses";
import { getProduct } from "@/features/products/queries/products";

type Props = {
  params: Promise<{ productId: string }>;
};

export default async function EditProductPage({ params }: Props) {
  const { productId } = await params;

  const [product, courses] = await Promise.all([
    getProduct(productId),
    getProductAvaiableCourses(),
  ]);
  if (!product || !courses) notFound();

  return (
    <div className="max-w-md mx-auto">
      <PageHeader
        title="Edit Product"
        description="Update product details, pricing, and associated courses."
      />
      <Card>
        <CardContent>
          <ProductForm
            courses={courses}
            product={{
              ...product,
              courseIds: product.courseProduct.map(({ courseId }) => courseId),
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
