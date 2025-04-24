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
import CourseCard from "@/features/courses/components/CourseCard";
import { getCourseIdTag } from "@/features/courses/db/cache/courses";
import { getUserProductAccessUserTag } from "@/features/courses/db/cache/userCourseAccess";
import { getCourseSectionCourseTag } from "@/features/coursesSections/db/cache";
import { getLessonCourseTag } from "@/features/lessons/db/cache/lessons";
import { getUserLessonCompleteUserTag } from "@/features/lessons/db/cache/lessonsComplete";
import { formatPlural } from "@/lib/formatters";
import { auth } from "@clerk/nextjs/server";
import { and, countDistinct, desc, eq, inArray } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import Link from "next/link";
import { Suspense } from "react";

export default function CoursesPage() {
  return (
    <>
      <PageHeader title="My courses" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols- gap-4">
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
    </>
  );
}

async function CourseGrid() {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();

  const courses = await getUserCourses(userId);

  if (!courses.length)
    return (
      <div className="flex flex-col gap-2 items-start">
        You have no courses yet
        <Button asChild size="lg">
          <Link href="/">Browse Courses</Link>
        </Button>
      </div>
    );

  return courses.map((course) => <CourseCard key={course.id} {...course} />);
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

export async function getUserCourses(userId: string) {
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
        inArray(lessons.status, ["public", "preview"])
      )
    )
    .leftJoin(
      userLessonComplete,
      and(
        eq(userLessonComplete.lessonId, lessons.id),
        eq(userLessonComplete.clerkUserId, userId)
      )
    )
    .orderBy(desc(courses.name))
    .groupBy(courses.id, userCourseAccess.clerkUserId);

  cacheTag(
    ...dbCourses.flatMap((course) => [
      getCourseIdTag(course.id),
      getCourseSectionCourseTag(course.id),
      getLessonCourseTag(course.id),
    ])
  );

  return dbCourses;
}
