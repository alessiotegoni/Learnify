import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, text } from "drizzle-orm/pg-core";
import { id, timestamps } from "../schemaHelpers";
import { courseProduct } from "./courseProduct";
import { userCourseAccess } from "./userCourseAccess";

export const productStatuses = ["public", "private"] as const;
export type ProductStatus = (typeof productStatuses)[number];

export const statusEnum = pgEnum("product_status", productStatuses);

export const products = pgTable("products", {
  id,
  name: text().notNull(),
  description: text().notNull(),
  imageUrl: text().notNull(),
  priceInDollars: integer().notNull(),
  status: statusEnum().notNull().default("private"),
  ...timestamps,
});

export const productsRelations = relations(products, ({ many }) => ({
  courseProduct: many(courseProduct),
  allowedAccesses: many(userCourseAccess),
}));
