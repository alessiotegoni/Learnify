import PageHeader from "@/components/PageHeader";
import { db } from "@/drizzle/db";
import { getCourseGlobalTag } from "@/features/courses/db/cache/courses";
import ProductForm from "@/features/products/components/ProductForm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

export default async function NewProductPage() {
  const courses = await getCourses();

  return (
    <>
      <PageHeader title="New Product" />
      <ProductForm courses={courses} />
    </>
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
