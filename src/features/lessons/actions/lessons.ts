"use server";

import { LessonSchemaType, lessonSchema } from "../schemas/lessons";
import {
  insertLesson,
  updateLesson as updateLessonsDb,
  updateLessonsOrders as updateLessonsOrdersDb,
  deleteLesson as deleteLessonsDb,
} from "../db/lessons";
import { isAdmin } from "@/services/clerk";

export async function createLesson(
  order: number,
  values: LessonSchemaType,
  courseId: string
) {
  const { data, success } = lessonSchema.safeParse(values);

  if (!success || !(await isAdmin()))
    return { error: true, message: "Error creating lesson" };

  await insertLesson({ ...data, order }, courseId);

  return { error: false, message: "Succesfully created lesson" };
}

export async function updateLesson(
  id: string,
  values: LessonSchemaType,
  courseId: string
) {
  const { data, success } = lessonSchema.safeParse(values);

  if (!success || !(await isAdmin()))
    return { error: true, message: "Error updating lesson" };

  await updateLessonsDb(data, id, courseId);

  return { error: false, message: "Succesfully updated lesson" };
}

export async function updateLessonsOrder(
  lessonsIds: string[],
  courseId: string
) {
  if (!lessonsIds.length || !(await isAdmin()))
    return { error: true, message: "Error reordering lesson" };

  await updateLessonsOrdersDb(lessonsIds, courseId);

  return { error: false, message: "Succesfully reordered lesson" };
}

export async function deleteLesson(
  id: string,
  courseSectionId: string,
  courseId: string
) {
  if (!(await isAdmin()))
    return { error: true, message: "Error deleting lesson" };

  await deleteLessonsDb(id, courseSectionId, courseId);

  return { error: false, message: "Succesfully deleted lesson" };
}
