import PageHeader from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import ViewCourseBtn from "@/components/ViewCourseBtn";
import { db } from "@/drizzle/db";
import {
  courses,
  courseSections,
  lessons,
  userLessonComplete,
} from "@/drizzle/schema";
import { getCourseIdTag } from "@/features/courses/db/cache/courses";
import { getUserLessonCompleteUserTag } from "@/features/lessons/db/cache/lessonsComplete";
import { formatPlural } from "@/lib/formatters";
import { auth } from "@clerk/nextjs/server";
import { and, count, eq } from "drizzle-orm";
import { BookOpen, Clock, PlayCircle } from "lucide-react";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  const course = await getCourse(courseId);
  if (!course) return notFound();

  return (
    <div className="p-2">
      <PageHeader title={course.name} className="mb-2" />
      <div className="space-y-6">
        <p className="text-muted-foreground text-lg">{course.description}</p>

        <Suspense fallback={<CourseUserStatsSkeleton />}>
          <CourseUserStats courseId={courseId} />
        </Suspense>

        <div className="flex flex-col sm:flex-row gap-4">
          <ViewCourseBtn
            courseId={course.id}
            className="w-fit rounded-full h-9"
          >
            <PlayCircle className="size-5" />
          </ViewCourseBtn>
          <Button variant="outline" asChild className="rounded-full">
            <Link href="/courses">Back to My Courses</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

async function CourseUserStats({ courseId }: { courseId: string }) {
  const { userId } = await auth();
  if (!userId) return null;

  const stats = await getCourseUserStats(courseId, userId);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center">
        <Badge variant="secondary" className="gap-1.5">
          <BookOpen className="size-4" />
          {formatPlural(
            stats.totalLessons,
            { singular: "lesson", plural: "lessons" },
            true
          )}
        </Badge>
        <Badge variant="secondary" className="gap-1.5">
          <Clock className="size-4" />
          4h 30m total
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Your progress</span>
          <span className="font-medium">
            {stats.completedLessons}/{stats.totalLessons} lessons
          </span>
        </div>
        <Progress
          value={
            stats.totalLessons
              ? (stats.completedLessons / stats.totalLessons) * 100
              : 0
          }
          className="h-2"
        />
      </div>
    </div>
  );
}

function CourseUserStatsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <div className="h-6 w-24 bg-muted rounded-full animate-pulse" />
        <div className="h-6 w-24 bg-muted rounded-full animate-pulse" />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          <div className="h-4 w-16 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-2 w-full bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}

async function getCourse(id: string) {
  "use cache";
  cacheTag(getCourseIdTag(id));

  return db.query.courses.findFirst({
    columns: { id: true, name: true, description: true },
    where: (courses, { eq }) => eq(courses.id, id),
    with: {
      sections: {
        columns: {},
        where: ({ status }, { eq }) => eq(status, "public"),
        orderBy: ({ order }, { asc }) => asc(order),
        with: {
          lessons: {
            columns: { id: true },
            orderBy: ({ order }, { asc }) => asc(order),
            where: ({ status }, { inArray }) =>
              inArray(status, ["public", "preview"]),
          },
        },
      },
    },
  });
}

async function getCourseUserStats(courseId: string, userId: string) {
  "use cache";
  cacheTag(getCourseIdTag(courseId), getUserLessonCompleteUserTag(userId));

  const [data] = await db
    .select({
      totalLessons: count(lessons),
      completedLessons: count(userLessonComplete),
    })
    .from(courses)
    .leftJoin(courseSections, eq(courseSections.courseId, courses.id))
    .leftJoin(lessons, eq(lessons.courseSectionId, courseSections.id))
    .leftJoin(
      userLessonComplete,
      and(
        eq(userLessonComplete.clerkUserId, userId),
        eq(userLessonComplete.lessonId, lessons.id)
      )
    )
    .where(eq(courses.id, courseId));

  return data ?? { totalLessons: 0, completedLessons: 0 };
}
