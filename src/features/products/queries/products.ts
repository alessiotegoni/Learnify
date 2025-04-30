import { getProductIdTag } from "../db/cache";
import {
  courseProduct,
  products as productsTable,
  purchases,
} from "@/drizzle/schema";
import { asc, countDistinct, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { getProductGlobalTag } from "@/features/products/db/cache";
import { db } from "@/drizzle/db";

export async function getPublicProducts() {
  "use cache";
  cacheTag(getProductGlobalTag());

  return db.query.products.findMany({
    columns: {
      id: true,
      name: true,
      description: true,
      priceInDollars: true,
      imageUrl: true,
    },
    where: ({ status }, { eq }) => eq(status, "public"),
    orderBy: ({ createdAt }, { asc }) => asc(createdAt),
  });
}

export async function getPublicProduct(productId: string) {
  "use cache";
  cacheTag(getProductIdTag(productId));

  return db.query.products.findFirst({
    columns: {
      id: true,
      name: true,
      imageUrl: true,
      description: true,
      priceInDollars: true,
    },
    where: ({ id, status }, { and, eq }) =>
      and(eq(id, productId), eq(status, "public")),
  });
}

export async function getProducts() {
  "use cache";
  cacheTag(getProductGlobalTag());

  return db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      description: productsTable.description,
      status: productsTable.status,
      priceInDollars: productsTable.priceInDollars,
      imageUrl: productsTable.imageUrl,
      customersCount: countDistinct(purchases),
      coursesCount: countDistinct(courseProduct),
    })
    .from(productsTable)
    .leftJoin(purchases, eq(purchases.productId, productsTable.id))
    .leftJoin(courseProduct, eq(courseProduct.productId, productsTable.id))
    .orderBy(asc(productsTable.name))
    .groupBy(productsTable.id);
}

export async function getProduct(id: string) {
  "use cache";
  cacheTag(getProductIdTag(id));

  return db.query.products.findFirst({
    where: ({ id: productId }, { eq }) => eq(productId, id),
    columns: {
      createdAt: false,
      updatedAt: false,
    },
    with: {
      courseProduct: {
        columns: {
          courseId: true,
        },
      },
    },
  });
}
