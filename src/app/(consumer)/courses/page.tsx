import { FormattedDuration } from "@/components/FormattedDuration";
import PageHeader from "@/components/PageHeader";
import {
  SkeletonArray,
  SkeletonButton,
  SkeletonText,
} from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import ViewCourseBtn from "@/components/ViewCourseBtn";
import { db } from "@/drizzle/db";
import {
  courseProduct,
  courses,
  courseSections,
  lessons,
  products,
  userCourseAccess,
  userLessonComplete,
} from "@/drizzle/schema";
import { getCourseIdTag } from "@/features/courses/db/cache/courses";
import { getUserProductAccessUserTag } from "@/features/courses/db/cache/userCourseAccess";
import { getCourseSectionCourseTag } from "@/features/coursesSections/db/cache";
import { getLessonCourseTag } from "@/features/lessons/db/cache/lessons";
import { getUserLessonCompleteUserTag } from "@/features/lessons/db/cache/lessonsComplete";
import { formatPlural } from "@/lib/formatters";
import { auth } from "@clerk/nextjs/server";
import { and, count, countDistinct, desc, eq, sql, sum } from "drizzle-orm";
import { BookOpen, Clock, PlayCircle } from "lucide-react";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import Link from "next/link";
import { Suspense } from "react";

export default function CoursesPage() {
  return (
    <div className="container">
      <PageHeader
        title="My Learning"
        description="Track your progress and continue learning"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <Suspense
          fallback={
            <SkeletonArray amount={3}>
              <SkeletonCourseCard />
            </SkeletonArray>
          }
        >
          <CourseGrid />
        </Suspense>
      </div>
    </div>
  );
}

async function CourseGrid() {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();

  const courses = await getUserCourses(userId);

  if (!courses.length)
    return (
      <div className="col-span-full flex flex-col items-center text-center py-16">
        <div className="rounded-full bg-primary/10 p-4 mb-4">
          <BookOpen className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          You haven&apos;t enrolled in any courses yet. Browse our catalog to
          find courses that interest you.
        </p>
        <Button asChild size="lg" className="rounded-full">
          <Link href="/#courses">Browse Courses</Link>
        </Button>
      </div>
    );

  return courses.map((course) => (
    <Card key={course.id} className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">{course.name}</CardTitle>
        <CardDescription>
          {formatPlural(
            course.sectionsCount,
            { singular: "section", plural: "sections" },
            true
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-muted-foreground line-clamp-2 mb-4">
          {course.description}
        </p>

        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span className="font-medium">
              {course.completedLessonsCount}/{course.lessonsCount} lessons
            </span>
          </div>
          <Progress
            value={
              course.lessonsCount
                ? (course.completedLessonsCount / course.lessonsCount) * 100
                : 0
            }
            className="h-2"
          />
        </div>

        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <FormattedDuration totalSeconds={course.totalLessonsSeconds} />
          </div>
          <div className="flex items-center gap-1.5">
            <PlayCircle className="h-4 w-4" />
            <span>{course.lessonsCount} videos</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-3">
        <ViewCourseBtn courseId={course.id} />
      </CardFooter>
    </Card>
  ));
}

function SkeletonCourseCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <SkeletonText className="w-3/4" />
        </CardTitle>
        <CardDescription>
          <SkeletonText className="w-1/2" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SkeletonText rows={3} />
      </CardContent>
      <CardFooter>
        <SkeletonButton />
      </CardFooter>
    </Card>
  );
}

async function getUserCourses(userId: string) {
  "use cache";
  cacheTag(
    getUserProductAccessUserTag(userId),
    getUserLessonCompleteUserTag(userId)
  );

  const dbCourses = await db
    .select({
      id: courses.id,
      name: courses.name,
      description: courses.description,
      sectionsCount: countDistinct(courseSections),
      lessonsCount: countDistinct(lessons),
      totalLessonsSeconds: sql<number>`COALESCE(${sum(
        lessons.seconds
      )}, 0)`.mapWith(Number),
      completedLessonsCount: countDistinct(userLessonComplete),
    })
    .from(courses)
    .leftJoin(courseProduct, eq(courseProduct.courseId, courses.id))
    .leftJoin(
      products,
      and(
        eq(products.id, courseProduct.productId),
        eq(products.status, "public")
      )
    )
    .leftJoin(
      userCourseAccess,
      and(
        eq(userCourseAccess.productId, products.id),
        eq(userCourseAccess.clerkUserId, userId)
      )
    )
    .leftJoin(
      courseSections,
      and(
        eq(courseSections.courseId, courses.id),
        eq(courseSections.status, "public")
      )
    )
    .leftJoin(
      lessons,
      and(
        eq(lessons.courseSectionId, courseSections.id),
        eq(courseSections.status, "public")
      )
    )
    .leftJoin(
      userLessonComplete,
      and(
        eq(userLessonComplete.lessonId, lessons.id),
        eq(userLessonComplete.clerkUserId, userId)
      )
    )
    .where(eq(userCourseAccess.clerkUserId, userId))
    .orderBy(desc(courses.name))
    .groupBy(courses.id);

  console.log(dbCourses);

  cacheTag(
    ...dbCourses.flatMap((course) => [
      getCourseIdTag(course.id),
      getCourseSectionCourseTag(course.id),
      getLessonCourseTag(course.id),
    ])
  );

  return dbCourses;
}
