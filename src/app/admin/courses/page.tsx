import { Button } from "@/components/ui/button";
import { db } from "@/drizzle/db";
import {
  courseProduct,
  courseSections,
  courses as courseTable,
  lessons,
  userCourseAccess,
} from "@/drizzle/schema";
import CourseTable from "@/features/courses/components/CourseTable";
import { getCourseGlobalTag } from "@/features/courses/db/cache/courses";
import { getUserProductAccessGlobalTag } from "@/features/courses/db/cache/userCourseAccess";
import { getCourseSectionGlobalTag } from "@/features/coursesSections/db/cache";
import { getLessonGlobalTag } from "@/features/lessons/db/cache/lessons";
import { asc, countDistinct, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import Link from "next/link";
import { Plus } from "lucide-react";
import PageHeader from "@/components/PageHeader";

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <>
      <PageHeader
        title="Courses"
        description="Manage your courses, sections, and lessons."
      >
        <Button asChild className="gap-1.5 rounded-full">
          <Link href="/admin/courses/new">
            <Plus className="size-4" />
            Create Course
          </Link>
        </Button>
      </PageHeader>
      <div className="rounded-xl border overflow-hidden bg-card">
        <CourseTable courses={courses} />
      </div>
    </>
  );
}

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
