import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/drizzle/db";
import { getCourseIdTag } from "@/features/courses/db/cache/courses";
import { getCourseSectionCourseTag } from "@/features/coursesSections/db/cache";
import { getLessonCourseTag } from "@/features/lessons/db/cache/lessons";
import { getProductIdTag } from "@/features/products/db/cache";
import { userOwnsProduct } from "@/features/products/db/products";
import { formatPlural, formatPrice } from "@/lib/formatters";
import { sumArray } from "@/lib/sumArray";
import { getUserCoupon } from "@/lib/userCountryHeader";
import { auth } from "@clerk/nextjs/server";
import { VideoIcon } from "lucide-react";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type Props = {
  params: Promise<{ productId: string }>;
};

export default async function ProductPage({ params }: Props) {
  const { productId } = await params;
  const product = await getPublicProduct(productId);

  if (!product) notFound();

  const courseCount = product.courses.length;
  const lessonsCount = sumArray(product.courses, (course) =>
    sumArray(course.sections, (section) => section.lessons.length)
  );

  return (
    <>
      <div className="flex gap-16 items-center justify-between">
        <div className="flex gap-6 flex-col items-start">
          <div className="flex flex-col gap-2">
            <Suspense
              fallback={
                <div className="text-xl">
                  {formatPrice(product.priceInDollars)}
                </div>
              }
            >
              <Price price={product.priceInDollars} />
            </Suspense>
            <h1 className="text-4xl font-semibold">{product.name}</h1>
            <div className="text-muted-foreground">
              {formatPlural(
                courseCount,
                {
                  singular: "course",
                  plural: "courses",
                },
                true
              )}{" "}
              •{" "}
              {formatPlural(
                lessonsCount,
                {
                  singular: "lesson",
                  plural: "lessons",
                },
                true
              )}
            </div>
          </div>
          <div className="text-xl">{product.description}</div>
          <Suspense
            fallback={
              <Skeleton
                className={buttonVariants({
                  variant: "secondary",
                  className: "h-12 w-36",
                })}
              />
            }
          >
            <PurchaseButton productId={product.id} />
          </Suspense>
        </div>
        <div className="relative aspect-video max-w-lg grow shrink-0">
          <Image
            src={product.imageUrl}
            fill
            alt={product.name}
            className="object-cover rounded-xl"
          />
        </div>
      </div>
      {product.courses.length ? (
        <>
          <h2 className="font-semibold text-xl mt-8 mb-3">Courses</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {product.courses.map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <CardTitle>{course.name}</CardTitle>
                  <CardDescription>
                    {formatPlural(
                      course.sections.length,
                      {
                        singular: "section",
                        plural: "sections",
                      },
                      true
                    )}{" "}
                    •{" "}
                    {formatPlural(
                      sumArray(
                        course.sections,
                        (section) => section.lessons.length
                      ),
                      {
                        singular: "lesson",
                        plural: "lessons",
                      },
                      true
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple">
                    {course.sections.map((section, i) => (
                      <AccordionItem key={section.id} value={section.id}>
                        <AccordionTrigger className="flex items-center gap-2">
                          <div className="flex flex-col grow">
                            <span className="text-lg">{section.name}</span>
                            <span className="text-muted-foreground">
                              {formatPlural(
                                section.lessons.length,
                                {
                                  singular: "lesson",
                                  plural: "lessons",
                                },
                                true
                              )}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="flex flex-col gap-2 ml-2">
                          {section.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="flex items-center gap-2 text-base"
                            >
                              <VideoIcon className="size-4" />
                              {lesson.status === "preview" ? (
                                <Link
                                  className="underline"
                                  href={`/courses/${course.id}/lessons/${lesson.id}`}
                                >
                                  {lesson.name}
                                </Link>
                              ) : (
                                lesson.name
                              )}
                            </div>
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <p>No courses yet</p>
      )}
    </>
  );
}

async function PurchaseButton({ productId }: { productId: string }) {
  const { userId } = await auth();

  const hasProduct =
    !!userId && (await userOwnsProduct({ clerkUserId: userId, productId }));

  return (
    <Button
      className="text-xl h-auto py-4 px-8 rounded-lg"
      disabled={hasProduct}
      asChild={!hasProduct}
    >
      {hasProduct ? (
        "You already own this product"
      ) : (
        <Link href={`/products/${productId}/purchase`}>Get Now</Link>
      )}
    </Button>
  );
}

export async function Price({ price }: { price: number }) {
  const coupon = await getUserCoupon();
  if (price === 0 || !coupon)
    return <div className="text-xl">{formatPrice(price)}</div>;

  return (
    <div className="flex gap-2 items-baseline">
      <div className="line-through text-xs opacity-50">
        {formatPrice(price)}
      </div>
      <div className="text-xl">
        {formatPrice(price * (1 - coupon.discountPercentage))}
      </div>
    </div>
  );
}

async function getPublicProduct(id: string) {
  "use cache";
  cacheTag(getProductIdTag(id));

  const product = await db.query.products
    .findFirst({
      columns: {
        id: true,
        name: true,
        description: true,
        priceInDollars: true,
        imageUrl: true,
      },
      where: ({ id: productId, status }, { and, eq }) =>
        and(eq(status, "public"), eq(productId, id)),
      with: {
        courseProduct: {
          columns: {},
          with: {
            course: {
              columns: { id: true, name: true },
              with: {
                sections: {
                  columns: { id: true, name: true },
                  where: ({ status }, { eq }) => eq(status, "public"),
                  orderBy: ({ order }, { asc }) => asc(order),
                  with: {
                    lessons: {
                      columns: { id: true, name: true, status: true },
                      where: ({ status }, { inArray }) =>
                        inArray(status, ["public", "preview"]),
                      orderBy: ({ order }, { asc }) => asc(order),
                    },
                  },
                },
              },
            },
          },
        },
      },
    })
    .then((product) => {
      if (!product) return product;

      const { courseProduct, ...restProduct } = product;
      return {
        courses: courseProduct.map(({ course }) => course),
        ...restProduct,
      };
    });

  if (!product) return product;

  cacheTag(
    ...product.courses.flatMap(({ id }) => [
      getCourseSectionCourseTag(id),
      getLessonCourseTag(id),
      getCourseIdTag(id),
    ])
  );

  return product;
}
