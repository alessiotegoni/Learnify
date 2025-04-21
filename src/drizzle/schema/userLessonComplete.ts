import { pgTable, primaryKey, text, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "../schemaHelpers";
import { relations } from "drizzle-orm";
// import { users } from "./user";
import { lessons } from "./lesson";

export const userLessonComplete = pgTable(
  "user_lesson_complete",
  {
    clerkUserId: text()
      .notNull(),
      // .references(() => users.id, { onDelete: "cascade" }),
    lessonId: uuid()
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (t) => [primaryKey({ columns: [t.clerkUserId, t.lessonId] })]
);

export const userLessonCompleteRelations = relations(
  userLessonComplete,
  ({ one }) => ({
    // user: one(users, {
    //   references: [users.id],
    //   fields: [userLessonComplete.userId],
    // }),
    lesson: one(lessons, {
      references: [lessons.id],
      fields: [userLessonComplete.lessonId],
    }),
  })
);
