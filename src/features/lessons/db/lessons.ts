import { db } from "@/drizzle/db";
import { lessons } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";
import { revalidateLessonCache } from "./cache/lessons";
import { LessonSchemaType } from "../schemas/lessons";

export async function insertLesson(
  data: typeof lessons.$inferInsert,
  courseId: string
) {
  const [newLesson] = await db
    .insert(lessons)
    .values(data)
    .returning({ id: lessons.id });

  if (!newLesson) throw new Error("Failed to create lesson");

  revalidateLessonCache({ id: newLesson.id, courseId });
}

export async function updateLesson(
  data: LessonSchemaType,
  id: string,
  courseId: string
) {
  const { rowCount } = await db
    .update(lessons)
    .set(data)
    .where(eq(lessons.id, id));

  if (!rowCount) throw new Error("Failed to update lesson");

  revalidateLessonCache({ id, courseId });
}

export async function updateLessonsOrders(
  lessonIds: string[],
  courseId: string
) {
  const lessonsList = await Promise.all(
    lessonIds.map((id, index) =>
      db
        .update(lessons)
        .set({ order: index })
        .where(eq(lessons.id, id))
        .returning({ courseSectionId: lessons.courseSectionId, id: lessons.id })
    )
  );
  
  lessonsList
    .flat()
    .forEach(({ id }) => revalidateLessonCache({ id, courseId }));
}

export async function deleteLesson(
  id: string,
  courseSectionId: string,
  courseId: string
) {
  const { rowCount } = await db
    .delete(lessons)
    .where(
      and(eq(lessons.id, id), eq(lessons.courseSectionId, courseSectionId))
    );

  if (!rowCount) throw new Error("Failed to delete lesson");

  revalidateLessonCache({ id, courseId });
}
