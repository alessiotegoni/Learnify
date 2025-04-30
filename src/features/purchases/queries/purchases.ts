import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { getPurchaseGlobalTag } from "../db/cache";
import { db } from "@/drizzle/db";

export async function getPurchases(userId: string) {
  "use cache";
  cacheTag(getPurchaseGlobalTag());

  return db.query.purchases.findMany({
    columns: {
      id: true,
      pricePaidInCents: true,
      productDetails: true,
      refundedAt: true,
      createdAt: true,
    },
    where: ({ clerkUserId }, { eq }) => eq(clerkUserId, userId),
    orderBy: ({ createdAt }, { desc }) => desc(createdAt),
  });
}
