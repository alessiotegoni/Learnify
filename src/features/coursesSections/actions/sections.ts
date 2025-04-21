"use server";

import { z } from "zod";
import { sectionSchema } from "../schemas/sections";
import {
  insertSection,
  updateSection as updateSectionDb,
  updateSectionOrders as updateSectionOrdersDb,
  deleteSection as deleteSectionDb,
} from "../db/sections";
import { isAdmin } from "@/services/clerk";

export async function createSection(
  order: number,
  values: z.infer<typeof sectionSchema>,
  courseId: string
) {
  const { data, success } = sectionSchema.safeParse(values);

  if (!success || !(await isAdmin()))
    return { error: true, message: "Error creating section" };

  await insertSection({ ...data, order, courseId });

  return { error: false, message: "Succesfully created section" };
}

export async function updateSection(
  id: string,
  values: z.infer<typeof sectionSchema>,
  courseId: string
) {
  const { data, success } = sectionSchema.safeParse(values);

  if (!success || !(await isAdmin()))
    return { error: true, message: "Error updating section" };

  await updateSectionDb({ ...data, courseId }, id);

  return { error: false, message: "Succesfully updated section" };
}

export async function updateSectionOrders(sectionIds: string[]) {
  if (!sectionIds.length || !(await isAdmin()))
    return { error: true, message: "Error reordering section" };

  await updateSectionOrdersDb(sectionIds);

  return { error: false, message: "Succesfully reordered section" };
}

export async function deleteSection(id: string, courseId: string) {
  if (!(await isAdmin()))
    return { error: true, message: "Error deleting section" };

  await deleteSectionDb(id, courseId);

  return { error: false, message: "Succesfully deleted section" };
}
