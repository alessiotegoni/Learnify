import { db } from "@/drizzle/db";
import { purchases } from "@/drizzle/schema";
import { revalidatePurchaseCache } from "./cache";
import { eq } from "drizzle-orm";

export async function insertPurchase(
  data: typeof purchases.$inferInsert,
  trx: Omit<typeof db, "$client"> = db
) {
  const [newPurchase] = await trx
    .insert(purchases)
    .values(data)
    .onConflictDoNothing()
    .returning({ id: purchases.id });

  if (newPurchase)
    revalidatePurchaseCache({ id: newPurchase.id, userId: data.clerkUserId });
}

export async function updatePurchase(
  id: string,
  data: Partial<typeof purchases.$inferInsert>,
  trx: Omit<typeof db, "$client"> = db
) {
  const [updatedPurchase] = await trx
    .update(purchases)
    .set(data)
    .where(eq(purchases.id, id))
    .returning();

  if (!updatedPurchase) throw new Error("Error updating the purchase");

  revalidatePurchaseCache({ id, userId: updatedPurchase.clerkUserId });

  return updatedPurchase;
}
