import { db } from "@/drizzle/db";
import { getCourseGlobalTag } from "@/features/courses/db/cache/courses";
import ProductForm from "@/features/products/components/ProductForm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { Card, CardContent } from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";

export default async function NewProductPage() {
  const courses = await getCourses();

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

export async function getCourses() {
  "use cache";
  cacheTag(getCourseGlobalTag());

  return db.query.courses
    .findMany({
      columns: { id: true, name: true },
      orderBy: ({ createdAt }, { asc }) => asc(createdAt),
    })
    .then((courses) =>
      courses.map(({ id: value, name: label }) => ({ value: value, label }))
    );
}
