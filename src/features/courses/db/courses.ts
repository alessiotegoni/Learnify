import { db } from "@/drizzle/db";
import { courses } from "@/drizzle/schema";
import { revalidateCourseCache } from "./cache/courses";
import { eq } from "drizzle-orm";

export async function insertCourse(data: typeof courses.$inferInsert) {
  const [newCourse] = await db
    .insert(courses)
    .values(data)
    .returning({ id: courses.id });

  if (!newCourse) throw new Error("Failed to create course");

  revalidateCourseCache(newCourse.id);

  return newCourse.id;
}

export async function updateCourse(
  { name, description }: typeof courses.$inferInsert,
  id: string
) {
  const { rowCount } = await db
    .update(courses)
    .set({ name, description })
    .where(eq(courses.id, id));

  if (!rowCount) throw new Error("Failed to update course");

  revalidateCourseCache(id);
}

export async function deleteCourse(id: string) {
  const { rowCount } = await db.delete(courses).where(eq(courses.id, id));

  if (!rowCount) throw new Error("Failed to delete course");

  revalidateCourseCache(id);
}
