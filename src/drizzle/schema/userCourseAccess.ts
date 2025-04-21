import { pgTable, primaryKey, text, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "../schemaHelpers";
// import { users } from "./user";
import { products } from "./product";
import { relations } from "drizzle-orm";

export const userCourseAccess = pgTable(
  "user_product_access",
  {
    clerkUserId: text().notNull(),
    // .references(() => users.id, { onDelete: "cascade" }),
    productId: uuid()
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (t) => [primaryKey({ columns: [t.clerkUserId, t.productId] })]
);

export const userCourseAccessRelations = relations(
  userCourseAccess,
  ({ one }) => ({
    // user: one(users, {
    //   references: [users.id],
    //   fields: [userCourseAccess.userId],
    // }),
    product: one(products, {
      fields: [userCourseAccess.productId],
      references: [products.id],
    }),
  })
);
