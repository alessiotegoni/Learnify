import { db } from "@/drizzle/db";
import {
  courseProduct,
  courseSections,
  courses as courseTable,
  lessons,
  userCourseAccess,
} from "@/drizzle/schema";
import { getCourseGlobalTag } from "@/features/courses/db/cache/courses";
import { getUserProductAccessGlobalTag } from "@/features/courses/db/cache/userCourseAccess";
import { getCourseSectionGlobalTag } from "@/features/coursesSections/db/cache";
import { getLessonGlobalTag } from "@/features/lessons/db/cache/lessons";
import { asc, countDistinct, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

export async function getCourses() {
  "use cache";
  cacheTag(
    getCourseGlobalTag(),
    getUserProductAccessGlobalTag(),
    getCourseSectionGlobalTag(),
    getLessonGlobalTag()
  );

  return db
    .select({
      id: courseTable.id,
      name: courseTable.name,
      description: courseTable.description,
      sectionsCount: countDistinct(courseSections),
      lessonsCount: countDistinct(lessons),
      studentsCount: countDistinct(userCourseAccess),
    })
    .from(courseTable)
    .leftJoin(courseSections, eq(courseSections.courseId, courseTable.id))
    .leftJoin(lessons, eq(lessons.courseSectionId, courseSections.id))
    .leftJoin(courseProduct, eq(courseProduct.courseId, courseTable.id))
    .leftJoin(
      userCourseAccess,
      eq(userCourseAccess.productId, courseProduct.productId)
    )
    .orderBy(asc(courseTable.name))
    .groupBy(courseTable.id);
}

export async function getProductAvaiableCourses() {
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
