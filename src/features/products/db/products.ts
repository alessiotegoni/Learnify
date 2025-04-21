import { db } from "@/drizzle/db";
import { courseProduct, products, purchases } from "@/drizzle/schema";
import { and, count, eq, isNull } from "drizzle-orm";
import { revalidateProductCache } from "../db/cache";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { getPurchaseUserTag } from "@/features/purchases/db/cache";

export async function userOwnsProduct({
  clerkUserId,
  productId,
}: {
  clerkUserId: string;
  productId: string;
}) {
  "use cache";
  cacheTag(getPurchaseUserTag(clerkUserId));

  const [res] = await db
    .select({ count: count() })
    .from(purchases)
    .where(
      and(
        eq(purchases.clerkUserId, clerkUserId),
        eq(purchases.productId, productId),
        isNull(purchases.refundedAt)
      )
    );

  return !!res?.count;
}

export async function insertProduct(
  data: typeof products.$inferInsert & { courseIds: string[] }
) {
  const productId = await db.transaction(async (trx) => {
    const [newProduct] = await trx
      .insert(products)
      .values(data)
      .returning({ id: products.id });

    if (!newProduct) {
      trx.rollback();
      throw new Error("Failed to create product");
    }

    const { rowCount } = await trx.insert(courseProduct).values(
      data.courseIds.map((courseId) => ({
        productId: newProduct.id,
        courseId,
      }))
    );

    console.log(rowCount, data.courseIds.length);

    if ((rowCount as unknown) !== data.courseIds.length) {
      trx.rollback();
      throw new Error("Failed to create product courses");
    }

    return newProduct.id;
  });

  revalidateProductCache(productId);

  return productId;
}

export async function updateProduct(
  {
    courseIds,
    ...data
  }: typeof products.$inferInsert & { courseIds: string[] },
  id: string
) {
  await db.transaction(async (trx) => {
    const { rowCount: productsUpdated } = await trx
      .update(products)
      .set(data)
      .where(eq(products.id, id));

    if (!productsUpdated) {
      trx.rollback();
      throw new Error("Failed to update product");
    }

    await trx.delete(courseProduct).where(eq(courseProduct.productId, id));

    const { rowCount } = await trx.insert(courseProduct).values(
      courseIds.map((courseId) => ({
        productId: id,
        courseId,
      }))
    );

    if ((rowCount as unknown) !== courseIds.length) {
      trx.rollback();
      throw new Error("Failed to create product courses");
    }
  });

  revalidateProductCache(id);
}

export async function deleteProduct(id: string) {
  const { rowCount } = await db.delete(products).where(eq(products.id, id));

  if (!rowCount) throw new Error("Failed to delete product");

  revalidateProductCache(id);
}
