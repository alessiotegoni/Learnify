import { db } from "@/drizzle/db";
import { getPurchaseGlobalTag } from "@/features/purchases/db/cache";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";


export async function getPurchases() {
    "use cache";
    cacheTag(getPurchaseGlobalTag());

    return db.query.purchases.findMany({
      columns: {
        id: true,
        clerkUserId: true,
        pricePaidInCents: true,
        refundedAt: true,
        userDetails: true,
        productDetails: true,
        createdAt: true,
      },
      orderBy: ({ createdAt }, { desc }) => desc(createdAt),
    });
  }
