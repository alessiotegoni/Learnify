import { db } from "@/drizzle/db";
import { courses, courseSections } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";
import { revalidateCourseSectionCache } from "./cache";

export async function insertSection(data: typeof courseSections.$inferInsert) {
  const [newSection] = await db
    .insert(courseSections)
    .values(data)
    .returning({ id: courses.id });

  if (!newSection) throw new Error("Failed to create section");

  revalidateCourseSectionCache({ id: newSection.id, courseId: data.courseId });
}

export async function updateSection(
  data: Pick<
    typeof courseSections.$inferInsert,
    "name" | "status" | "courseId"
  >,
  id: string
) {
  const { rowCount } = await db
    .update(courseSections)
    .set(data)
    .where(
      and(eq(courseSections.id, id), eq(courseSections.courseId, data.courseId))
    );

  if (!rowCount) throw new Error("Failed to update section");

  revalidateCourseSectionCache({ id, courseId: data.courseId });
}

export async function updateSectionOrders(sectionIds: string[]) {
  const sections = await Promise.all(
    sectionIds.map((id, index) =>
      db
        .update(courseSections)
        .set({ order: index })
        .where(eq(courseSections.id, id))
        .returning({ courseId: courseSections.courseId, id: courseSections.id })
    )
  );

  sections
    .flat()
    .forEach(({ id, courseId }) =>
      revalidateCourseSectionCache({ courseId, id })
    );
}

export async function deleteSection(id: string, courseId: string) {
  const { rowCount } = await db
    .delete(courseSections)
    .where(
      and(eq(courseSections.id, id), eq(courseSections.courseId, courseId))
    );

  if (!rowCount) throw new Error("Failed to delete section");

  revalidateCourseSectionCache({ id, courseId });
}
