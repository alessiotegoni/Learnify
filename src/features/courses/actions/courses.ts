"use server";

import { z } from "zod";
import { courseSchema } from "../schemas/courses";
import { redirect } from "next/navigation";
import {
  insertCourse,
  updateCourse as updateCourseDb,
  deleteCourse as deleteCourseDb,
} from "../db/courses";
import { isAdmin } from "@/services/clerk";

export async function createCourse(values: z.infer<typeof courseSchema>) {
  const { data, success } = courseSchema.safeParse(values);

  if (!success || !(await isAdmin()))
    return { error: true, message: "Error creating your course" };

  const courseId = await insertCourse(data);

  redirect(`/admin/courses/${courseId}/edit`);
}

export async function updateCourse(
  id: string,
  values: z.infer<typeof courseSchema>
) {
  const { data, success } = courseSchema.safeParse(values);

  if (!success || !(await isAdmin()))
    return { error: true, message: "Error updating your course" };

  await updateCourseDb(data, id);

  return { error: false, message: "Succesfully updated your course" };
}

export async function deleteCourse(id: string) {
  if (!(await isAdmin()))
    return { error: true, message: "Error deleting your course" };

  await deleteCourseDb(id);

  return { error: false, message: "Succesfully deleted your course" };
}
