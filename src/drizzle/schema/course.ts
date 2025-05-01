import { relations } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";
import { id, timestamps } from "../schemaHelpers";
import { courseProduct } from "./courseProduct";
import { courseSections } from "./courseSection";

export const courses = pgTable("courses", {
  id,
  name: text().notNull(),
  description: text().notNull(),
  ...timestamps,
});

export const coursesRelations = relations(courses, ({ many }) => ({
  courseProduct: many(courseProduct),
  sections: many(courseSections),
}));
