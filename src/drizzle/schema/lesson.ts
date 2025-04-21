import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { id, timestamps } from "../schemaHelpers";
import { courseSections } from "./courseSection";
import { userLessonComplete } from "./userLessonComplete";

export const lessonStatuses = ["public", "private", "preview"] as const;
export type LessonStatus = (typeof lessonStatuses)[number];

export const lessonStatusEnum = pgEnum("lesson_status", lessonStatuses);

export const lessons = pgTable("lessons", {
  id,
  courseSectionId: uuid()
    .notNull()
    .references(() => courseSections.id, { onDelete: "cascade" }),
  name: text().notNull(),
  description: text(),
  youtubeVideoId: text().notNull(),
  order: integer().notNull(),
  status: lessonStatusEnum().notNull().default("private"),
  ...timestamps,
});

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  section: one(courseSections, {
    references: [courseSections.id],
    fields: [lessons.courseSectionId],
  }),
  completed: many(userLessonComplete)
}));
