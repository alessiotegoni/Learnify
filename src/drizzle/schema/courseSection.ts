import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { id, timestamps } from "../schemaHelpers";
import { courses } from "./course";
import { lessons } from "./lesson";

export const courseSectionStatuses = ["public", "private"] as const;
export type CourseSectionStatus = (typeof courseSectionStatuses)[number];

export const courseSectionEnum = pgEnum(
  "course_section_status",
  courseSectionStatuses
);

export const courseSections = pgTable("course_sections", {
  id,
  courseId: uuid()
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  name: text().notNull(),
  order: integer().notNull(),
  status: courseSectionEnum().notNull().default("private"),
  ...timestamps,
});

export const courseSectionRelations = relations(
  courseSections,
  ({ one, many }) => ({
    course: one(courses, {
      references: [courses.id],
      fields: [courseSections.courseId],
    }),
    lessons: many(lessons),
  })
);
