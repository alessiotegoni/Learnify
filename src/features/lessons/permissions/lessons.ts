import {
  courseProduct,
  courses,
  courseSections,
  lessons,
  LessonStatus,
  products,
  userCourseAccess,
} from "@/drizzle/schema";
import { UserRole } from "@/services/clerk";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { getLessonIdTag } from "../db/cache/lessons";
import { getUserProductAccessUserTag } from "@/features/courses/db/cache/userCourseAccess";
import { db } from "@/drizzle/db";
import { and, count, eq } from "drizzle-orm";

export async function canViewLesson(
  {
    role,
    userId,
  }: {
    userId: string | null;
    role: UserRole | undefined;
  },
  lesson: { id: string; status: LessonStatus }
) {
  "use cache";
  if (role === "admin" || lesson.status === "preview") return true;
  if (!userId || lesson.status === "private") return false;

  cacheTag(getUserProductAccessUserTag(userId), getLessonIdTag(lesson.id));

  const [data] = await db
    .select({ canView: count() })
    .from(userCourseAccess)
    .leftJoin(products, eq(products.id, userCourseAccess.productId))
    .leftJoin(courseProduct, eq(courseProduct.productId, products.id))
    .leftJoin(courses, eq(courses.id, courseProduct.courseId))
    .leftJoin(courseSections, eq(courseSections.courseId, courses.id))
    .leftJoin(lessons, eq(lessons.courseSectionId, courseSections.id))
    .where(
      and(eq(lessons.id, lesson.id), eq(userCourseAccess.clerkUserId, userId))
    )
    .limit(1);

  return !!data?.canView;
}
