import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { db } from "@/drizzle/db";
import CoursePageClient from "@/features/courses/components/CoursePageClient";
import { getCourseIdTag } from "@/features/courses/db/cache/courses";
import { getCourseSectionCourseTag } from "@/features/coursesSections/db/cache";
import { getLessonCourseTag } from "@/features/lessons/db/cache/lessons";
import { getUserLessonCompleteUserTag } from "@/features/lessons/db/cache/lessonsComplete";
import { mapCourse } from "@/lib/mapCourse";
import type { AwaitedReturn } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft, Info } from "lucide-react";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import Link from "next/link";
import { notFound } from "next/navigation";
import { type PropsWithChildren, Suspense } from "react";

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
    <div className="container grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6">
      <aside
        className="bg-card rounded-xl border overflow-hidden
      flex flex-col"
      >
        <div className="sticky top-0">
          <div className="flex items-center gap-2 p-4 border-b">
            <Button variant="ghost" size="icon" asChild className="shrink-0">
              <Link href="/courses">
                <ArrowLeft className="size-5" />
                <span className="sr-only">Back to courses</span>
              </Link>
            </Button>
            <div className="text-lg font-semibold truncate">{course.name}</div>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto shrink-0"
              asChild
            >
              <Link href={`/courses/${course.id}`}>
                <Info className="size-5" />
                <span className="sr-only">Course info</span>
              </Link>
            </Button>
          </div>
          <ScrollArea type="scroll">
            <div className="p-4">
              <Suspense
                fallback={<CoursePageClient course={mapCourse(course, [])} />}
              >
                <SuspenseBoundary course={course} />
              </Suspense>
            </div>
            <ScrollBar />
          </ScrollArea>
        </div>
      </aside>
      <div className="bg-card rounded-xl border p-4 overflow-y-auto h-fit">
        {children}
      </div>
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
