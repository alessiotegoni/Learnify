import PageHeader from "@/components/PageHeader";
import { db } from "@/drizzle/db";
import { getCourseIdTag } from "@/features/courses/db/cache/courses";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { notFound } from "next/navigation";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  const course = await getCourse(courseId);
  if (!course) return notFound();

  return (
    <>
      <PageHeader className="mb-2 mt-4" title={course.name} />
      <p className="text-muted-foreground">{course.description}</p>
    </>
  );
}

async function getCourse(id: string) {
  "use cache";
  cacheTag(getCourseIdTag(id));

  return db.query.courses.findFirst({
    columns: { id: true, name: true, description: true },
    where: (courses, { eq }) => eq(courses.id, id),
  });
}
