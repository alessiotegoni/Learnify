import { db } from "@/drizzle/db";
import { purchases, userCourseAccess } from "@/drizzle/schema";
import { revalidateUserProductAccessCache } from "./cache/userCourseAccess";
import { and, eq } from "drizzle-orm";
import { revalidatePurchaseCache } from "@/features/purchases/db/cache";

export async function addUserCourseAccess(
  clerkUserId: string,
  productId: string,
  trx: Omit<typeof db, "$client"> = db
) {
  const { rowCount } = await trx
    .insert(userCourseAccess)
    .values({ clerkUserId, productId })
    .onConflictDoNothing();

  if (rowCount)
    revalidateUserProductAccessCache({ userId: clerkUserId, productId });
}

export async function revokeUserCourseAccess(
  { id, clerkUserId, productId }: typeof purchases.$inferSelect,
  trx: Omit<typeof db, "$client"> = db
) {
  const { rowCount } = await trx
    .delete(userCourseAccess)
    .where(
      and(
        eq(userCourseAccess.clerkUserId, clerkUserId),
        eq(userCourseAccess.productId, productId)
      )
    );

  if (!rowCount) throw new Error();

  revalidatePurchaseCache({ id, userId: clerkUserId });
}
