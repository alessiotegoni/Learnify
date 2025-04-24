import { Button } from "@/components/ui/button";
import { db } from "@/drizzle/db";
import CoursePageClient from "@/features/courses/components/CoursePageClient";
import { getCourseIdTag } from "@/features/courses/db/cache/courses";
import { getCourseSectionCourseTag } from "@/features/coursesSections/db/cache";
import { getLessonCourseTag } from "@/features/lessons/db/cache/lessons";
import { getUserLessonCompleteUserTag } from "@/features/lessons/db/cache/lessonsComplete";
import { AwaitedReturn } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { Info } from "lucide-react";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PropsWithChildren, Suspense } from "react";

export default async function CoursePageLayout({
  params,
  children,
}: PropsWithChildren<{
  params: Promise<{ courseId: string }>;
}>) {
  const { courseId } = await params;

  const course = await getCourse(courseId);
  if (!course) return notFound();

  return (
    <div className="grid grid-cols-[300px_1fr] max-h-[calc(100dvh - 86px)] gap-8 -mt-5">
      <aside className="py-4">
        <div className="flex items-center">
          <div className="text-lg font-semibold">{course.name}</div>
          <Button variant="ghost" className="ml-auto">
            <Link href={`/courses/${course.id}`}>
              <Info />
            </Link>
          </Button>
        </div>
        <Suspense
          fallback={<CoursePageClient course={mapCourse(course, [])} />}
        >
          <SuspenseBoundary course={course} />
        </Suspense>
      </aside>
      <div>{children}</div>
    </div>
  );
}

async function getCourse(id: string) {
  "use cache";
  cacheTag(
    getCourseIdTag(id),
    getCourseSectionCourseTag(id),
    getLessonCourseTag(id)
  );

  return db.query.courses.findFirst({
    columns: { id: true, name: true },
    where: ({ id: courseId }, { eq }) => eq(courseId, id),
    with: {
      sections: {
        columns: { id: true, name: true },
        orderBy: ({ order }, { asc }) => asc(order),
        where: ({ status }, { eq }) => eq(status, "public"),
        with: {
          lessons: {
            columns: { id: true, name: true },
            orderBy: ({ order }, { asc }) => asc(order),
            where: ({ status }, { inArray }) =>
              inArray(status, ["public", "preview"]),
          },
        },
      },
    },
  });
}

async function SuspenseBoundary({
  course,
}: {
  course: AwaitedReturn<typeof getCourse>;
}) {
  const { userId } = await auth();
  const completedLessonIds = !userId ? [] : await getCompletedLessonIds(userId);

  return <CoursePageClient course={mapCourse(course, completedLessonIds)} />;
}

async function getCompletedLessonIds(userId: string) {
  "use cache";
  cacheTag(getUserLessonCompleteUserTag(userId));

  const data = await db.query.userLessonComplete.findMany({
    columns: { lessonId: true },
    where: ({ clerkUserId }, { eq }) => eq(clerkUserId, userId),
  });

  return data.map((d) => d.lessonId);
}

export function mapCourse(
  course: AwaitedReturn<typeof getCourse>,
  completedLessonIds: string[]
) {
  return {
    ...course,
    sections: course.sections.map((section) => ({
      ...section,
      lessons: section.lessons.map((lesson) => ({
        ...lesson,
        isComplete: completedLessonIds.includes(lesson.id),
      })),
    })),
  };
}
