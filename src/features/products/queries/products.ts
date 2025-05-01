import { getProductIdTag } from "../db/cache";
import {
  courseProduct,
  courses,
  courseSections,
  lessons,
  products as productsTable,
  purchases,
  userCourseAccess,
} from "@/drizzle/schema";
import { asc, count, countDistinct, desc, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { getProductGlobalTag } from "@/features/products/db/cache";
import { db } from "@/drizzle/db";
import { getLessonGlobalTag } from "@/features/lessons/db/cache/lessons";
import { getUserProductAccessGlobalTag } from "@/features/courses/db/cache/userCourseAccess";

export async function getPublicProducts() {
  "use cache";
  cacheTag(
    getProductGlobalTag(),
    getLessonGlobalTag(),
    getUserProductAccessGlobalTag()
  );

  const products = await db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      description: productsTable.description,
      priceInDollars: productsTable.priceInDollars,
      imageUrl: productsTable.imageUrl,
      lessonsCount: count(lessons),
      studentsCount: countDistinct(userCourseAccess),
    })
    .from(productsTable)
    .leftJoin(
      userCourseAccess,
      eq(userCourseAccess.productId, productsTable.id)
    )
    .leftJoin(courseProduct, eq(courseProduct.productId, productsTable.id))
    .leftJoin(courses, eq(courses.id, courseProduct.courseId))
    .leftJoin(courseSections, eq(courseSections.courseId, courses.id))
    .leftJoin(lessons, eq(lessons.courseSectionId, courseSections.id))
    .orderBy(desc(productsTable.createdAt))
    .groupBy(productsTable.id);

  return products;
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
