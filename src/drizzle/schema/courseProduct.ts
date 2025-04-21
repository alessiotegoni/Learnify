import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "../schemaHelpers";
import { courses } from "./course";
import { products } from "./product";
import { relations } from "drizzle-orm";

export const courseProduct = pgTable(
  "course_product",
  {
    courseId: uuid()
      .notNull()
      .references(() => courses.id, { onDelete: "restrict" }),
    productId: uuid()
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (t) => [primaryKey({ columns: [t.courseId, t.productId] })]
);

export const courseProductRelations = relations(courseProduct, ({ one }) => ({
  course: one(courses, {
    references: [courses.id],
    fields: [courseProduct.courseId],
  }),
  product: one(products, {
    references: [products.id],
    fields: [courseProduct.productId],
  }),
}));
