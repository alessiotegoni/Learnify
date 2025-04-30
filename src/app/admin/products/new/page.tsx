import ProductForm from "@/features/products/components/ProductForm";
import { Card, CardContent } from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";
import { getProductAvaiableCourses } from "@/features/courses/queries/courses";

export default async function NewProductPage() {
  const courses = await getProductAvaiableCourses();

  return (
    <div className="max-w-md mx-auto">
      <PageHeader
        title="New Product"
        description="Create a new product to sell on your platform."
      />
      <Card>
        <CardContent className="pt-6">
          <ProductForm courses={courses} />
        </CardContent>
      </Card>
    </div>
  );
}
