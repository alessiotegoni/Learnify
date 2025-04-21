import {
  pgTable,
  integer,
  jsonb,
  uuid,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { id, timestamps } from "../schemaHelpers";
import { relations } from "drizzle-orm";
// import { users } from "./user";
import { products } from "./product";

export const purchases = pgTable("purchases", {
  id,
  pricePaidInCents: integer().notNull(),
  productDetails: jsonb()
    .notNull()
    .$type<{ name: string; description: string; imageUrl: string }>(),
  userDetails: jsonb().notNull().$type<{ fullName: string | null }>(),
  clerkUserId: text().notNull(),
  // .references(() => users.id, { onDelete: "restrict" }),
  productId: uuid()
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),
  stripeSessionId: text().notNull().unique(),
  refundedAt: timestamp({ withTimezone: true }),
  ...timestamps,
});

export const purchaseRelations = relations(purchases, ({ one }) => ({
  // user: one(users, {
  //   references: [users.id],
  //   fields: [purchases.userId],
  // }),
  product: one(products, {
    references: [products.id],
    fields: [purchases.productId],
  }),
}));
