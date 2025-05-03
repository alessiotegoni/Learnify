// import { CardFooter } from "@/components/ui/card";
// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from "@/components/ui/accordion";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Skeleton } from "@/components/ui/skeleton";
// import { db } from "@/drizzle/db";
// import { getCourseIdTag } from "@/features/courses/db/cache/courses";
// import { getCourseSectionCourseTag } from "@/features/coursesSections/db/cache";
// import { getLessonCourseTag } from "@/features/lessons/db/cache/lessons";
// import { getProductIdTag } from "@/features/products/db/cache";
// import { userOwnsProduct } from "@/features/products/db/products";
// import { formatPlural, formatPrice } from "@/lib/formatters";
// import { sumArray } from "@/lib/sumArray";
// import { getUserCoupon } from "@/lib/userCountryHeader";
// import { auth } from "@clerk/nextjs/server";
// import {
//   BookOpen,
//   CheckCircle,
//   Clock,
//   PlayCircle,
//   Star,
//   VideoIcon,
// } from "lucide-react";
// import { cacheTag } from "next/dist/server/use-cache/cache-tag";
// import Image from "next/image";
// import Link from "next/link";
// import { notFound } from "next/navigation";
// import { Suspense } from "react";
// import { FormattedDuration } from "@/components/FormattedDuration";
// import { SkeletonArray } from "@/components/Skeleton";

type Props = {
  params: Promise<{ productId: string }>;
};

// { params }: Props

export default function ProductPage() {

  return null

  // return (
  //   <Suspense fallback={<ProductPageSkeleton />}>
  //     <SuspenseBoundary params={params} />
  //   </Suspense>
  // );
}

// async function SuspenseBoundary({ params }: Props) {
//   const { productId } = await params;

//   const product = await getPublicProduct(productId);
//   if (!product) return notFound();

//   const courseCount = product.courses.length;
//   const lessonsCount = sumArray(product.courses, (course) =>
//     sumArray(course.sections, (section) => section.lessons.length)
//   );
//   const totalSeconds = sumArray(product.courses, (course) =>
//     sumArray(course.sections, (section) =>
//       sumArray(section.lessons, (lesson) => lesson.seconds)
//     )
//   );

//   return (
//     <div className="container grid md:grid-cols-3 gap-10">
//       <div className="md:col-span-2 space-y-8">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight mb-2">
//             {product.name}
//           </h1>
//           <p className="text-xl text-muted-foreground mb-4">
//             {product.description}
//           </p>

//           <div className="flex flex-wrap gap-4 items-center">
//             <div className="flex items-center gap-1.5">
//               <BookOpen className="size-5 text-primary" />
//               <span>
//                 {formatPlural(
//                   courseCount,
//                   { singular: "course", plural: "courses" },
//                   true
//                 )}
//               </span>
//             </div>
//             <div className="flex items-center gap-1.5">
//               <VideoIcon className="size-5 text-primary" />
//               <span>
//                 {formatPlural(
//                   lessonsCount,
//                   { singular: "lesson", plural: "lessons" },
//                   true
//                 )}
//               </span>
//             </div>
//             <div className="flex items-center gap-1.5">
//               <Clock className="size-5 text-primary" />
//               <FormattedDuration totalSeconds={totalSeconds} />
//             </div>
//             <div className="flex items-center gap-1.5">
//               <Star className="size-5 text-primary fill-primary" />
//               <span className="font-medium">4.8</span>
//               <span className="text-muted-foreground">(120 reviews)</span>
//             </div>
//           </div>
//         </div>

//         <div className="aspect-video relative rounded-xl overflow-hidden">
//           <Image
//             src={product.imageUrl || "/placeholder.svg"}
//             fill
//             alt={product.name}
//             className="object-cover"
//             priority
//           />
//         </div>

//         {product.courses.length ? (
//           <div className="space-y-6">
//             <h2 className="text-2xl font-semibold">Course Content</h2>
//             <div className="grid grid-cols-1 gap-6">
//               {product.courses.map((course) => (
//                 <Card key={course.id}>
//                   <CardHeader className="pb-3">
//                     <CardTitle>{course.name}</CardTitle>
//                     <CardDescription>
//                       {formatPlural(
//                         course.sections.length,
//                         { singular: "section", plural: "sections" },
//                         true
//                       )}{" "}
//                       •{" "}
//                       {formatPlural(
//                         sumArray(
//                           course.sections,
//                           (section) => section.lessons.length
//                         ),
//                         { singular: "lesson", plural: "lessons" },
//                         true
//                       )}
//                     </CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                     <Accordion type="multiple" className="space-y-2">
//                       {course.sections.map((section) => (
//                         <AccordionItem
//                           key={section.id}
//                           value={section.id}
//                           className="border rounded-lg px-4"
//                         >
//                           <AccordionTrigger className="py-3 hover:no-underline">
//                             <div className="flex flex-col items-start text-left">
//                               <span className="text-base font-medium">
//                                 {section.name}
//                               </span>
//                               <span className="text-sm text-muted-foreground">
//                                 {formatPlural(
//                                   section.lessons.length,
//                                   { singular: "lesson", plural: "lessons" },
//                                   true
//                                 )}
//                               </span>
//                             </div>
//                           </AccordionTrigger>
//                           <AccordionContent className="pt-1 pb-3">
//                             <ul className="space-y-3">
//                               {section.lessons.map((lesson) => (
//                                 <li
//                                   key={lesson.id}
//                                   className="flex items-center gap-2"
//                                 >
//                                   {lesson.status === "preview" ? (
//                                     <PlayCircle className="h-4 w-4 text-primary flex-shrink-0" />
//                                   ) : (
//                                     <VideoIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
//                                   )}
//                                   {lesson.status === "preview" ? (
//                                     <Link
//                                       className="text-primary hover:underline"
//                                       href={`/courses/${course.id}/lessons/${lesson.id}`}
//                                     >
//                                       {lesson.name}
//                                       <Badge
//                                         variant="outline"
//                                         className="ml-2 text-xs border-primary text-primary"
//                                       >
//                                         Preview
//                                       </Badge>
//                                     </Link>
//                                   ) : (
//                                     <span>{lesson.name}</span>
//                                   )}
//                                 </li>
//                               ))}
//                             </ul>
//                           </AccordionContent>
//                         </AccordionItem>
//                       ))}
//                     </Accordion>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           </div>
//         ) : (
//           <div className="bg-muted/50 rounded-lg p-6 text-center">
//             <p className="text-muted-foreground">No courses available yet</p>
//           </div>
//         )}
//       </div>

//       <div className="md:col-span-1">
//         <div className="sticky top-20">
//           <Card className="overflow-hidden">
//             <CardHeader className="pb-3">
//               <Suspense
//                 fallback={
//                   <div className="text-2xl font-bold">
//                     {formatPrice(product.priceInDollars)}
//                   </div>
//                 }
//               >
//                 <Price price={product.priceInDollars} />
//               </Suspense>
//             </CardHeader>
//             <CardContent className="pb-3">
//               <ul className="space-y-3">
//                 {[
//                   "Full lifetime access",
//                   "Access on mobile and desktop",
//                   "Certificate of completion",
//                   "30-day money-back guarantee",
//                 ].map((feature, i) => (
//                   <li key={i} className="flex items-start gap-2">
//                     <CheckCircle className="size-5 text-primary flex-shrink-0 mt-0.5" />
//                     <span>{feature}</span>
//                   </li>
//                 ))}
//               </ul>
//             </CardContent>
//             <CardFooter className="pt-3">
//               <Suspense fallback={<Skeleton className="h-12 w-full" />}>
//                 <PurchaseButton productId={product.id} />
//               </Suspense>
//             </CardFooter>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }

// async function PurchaseButton({ productId }: { productId: string }) {
//   const { userId } = await auth();

//   const hasProduct =
//     !!userId && (await userOwnsProduct({ clerkUserId: userId, productId }));

//   return (
//     <Button
//       className="w-full text-lg py-6 rounded-xl"
//       disabled={hasProduct}
//       asChild={!hasProduct}
//     >
//       {hasProduct ? (
//         "You already own this course"
//       ) : (
//         <Link href={`/products/${productId}/purchase`}>Enroll Now</Link>
//       )}
//     </Button>
//   );
// }

// async function Price({ price }: { price: number }) {
//   const coupon = await getUserCoupon();
//   if (price === 0 || !coupon)
//     return <div className="text-xl font-bold">{formatPrice(price)}</div>;

//   return (
//     <div className="space-y-1">
//       <div className="flex items-center gap-2">
//         <div className="text-2xl font-bold">
//           {formatPrice(price * (1 - coupon.discountPercentage))}
//         </div>
//         <div className="line-through text-muted-foreground">
//           {formatPrice(price)}
//         </div>
//       </div>
//       <Badge
//         variant="outline"
//         className="bg-green-50 text-green-700 border-green-200"
//       >
//         {Math.round(coupon.discountPercentage * 100)}% off
//       </Badge>
//     </div>
//   );
// }

// async function getPublicProduct(id: string) {
//   "use cache";
//   cacheTag(getProductIdTag(id));

//   const product = await db.query.products
//     .findFirst({
//       columns: {
//         id: true,
//         name: true,
//         description: true,
//         priceInDollars: true,
//         imageUrl: true,
//       },
//       where: ({ id: productId, status }, { and, eq }) =>
//         and(eq(status, "public"), eq(productId, id)),
//       with: {
//         courseProduct: {
//           columns: {},
//           with: {
//             course: {
//               columns: { id: true, name: true },
//               with: {
//                 sections: {
//                   columns: { id: true, name: true },
//                   where: ({ status }, { eq }) => eq(status, "public"),
//                   orderBy: ({ order }, { asc }) => asc(order),
//                   with: {
//                     lessons: {
//                       columns: {
//                         id: true,
//                         name: true,
//                         status: true,
//                         seconds: true,
//                       },
//                       where: ({ status }, { inArray }) =>
//                         inArray(status, ["public", "preview"]),
//                       orderBy: ({ order }, { asc }) => asc(order),
//                     },
//                   },
//                 },
//               },
//             },
//           },
//         },
//       },
//     })
//     .then((product) => {
//       if (!product) return null;

//       const { courseProduct, ...restProduct } = product;
//       return {
//         courses: courseProduct.map(({ course }) => course),
//         ...restProduct,
//       };
//     });

//   if (!product) return product;

//   cacheTag(
//     ...product.courses.flatMap(({ id }) => [
//       getCourseSectionCourseTag(id),
//       getLessonCourseTag(id),
//       getCourseIdTag(id),
//     ])
//   );

//   return product;
// }

// function ProductPageSkeleton() {
//   return (
//     <div className="container grid md:grid-cols-3 gap-10">
//       <div className="md:col-span-2 space-y-8">
//         {/* Product title and description */}
//         <div>
//           <Skeleton className="h-9 w-3/4 mb-2" />
//           <Skeleton className="h-6 w-full mb-1" />
//           <Skeleton className="h-6 w-2/3 mb-4" />

//           <div className="flex flex-wrap gap-4 items-center">
//             <SkeletonArray amount={4}>
//               <div className="flex items-center gap-1.5">
//                 <Skeleton className="h-5 w-5 rounded-full" />
//                 <Skeleton className="h-4 w-20" />
//               </div>
//             </SkeletonArray>
//           </div>
//         </div>

//         {/* Product image */}
//         <div className="aspect-video relative rounded-xl overflow-hidden bg-muted animate-pulse" />

//         {/* Course content */}
//         <div className="space-y-6">
//           <Skeleton className="h-8 w-40" />
//           <div className="grid grid-cols-1 gap-6">
//             <SkeletonArray amount={2}>
//               <Card className="overflow-hidden">
//                 <CardHeader className="pb-3">
//                   <Skeleton className="h-6 w-1/3 mb-1" />
//                   <Skeleton className="h-4 w-1/4" />
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-2">
//                     <SkeletonArray amount={3}>
//                       <div className="border rounded-lg px-4 py-4 space-y-2">
//                         <div className="flex flex-col items-start text-left">
//                           <Skeleton className="h-5 w-1/3 mb-1" />
//                           <Skeleton className="h-4 w-1/4" />
//                         </div>
//                       </div>
//                     </SkeletonArray>
//                   </div>
//                 </CardContent>
//               </Card>
//             </SkeletonArray>
//           </div>
//         </div>
//       </div>

//       {/* Pricing card */}
//       <div className="md:col-span-1">
//         <div className="sticky top-20">
//           <Card className="overflow-hidden">
//             <CardHeader className="pb-3">
//               <Skeleton className="h-8 w-28" />
//             </CardHeader>
//             <CardContent className="pb-3">
//               <ul className="space-y-3">
//                 <SkeletonArray amount={4}>
//                   <li className="flex items-start gap-2">
//                     <Skeleton className="h-5 w-5 rounded-full flex-shrink-0 mt-0.5" />
//                     <Skeleton className="h-5 w-full" />
//                   </li>
//                 </SkeletonArray>
//               </ul>
//             </CardContent>
//             <CardFooter className="pt-3">
//               <Skeleton className="h-12 w-full rounded-full" />
//             </CardFooter>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }
