import { SkeletonArray, SkeletonText } from "@/components/Skeleton";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/drizzle/db";
import {
  courseSections,
  courses,
  lessons,
  products,
  purchases,
  userCourseAccess,
} from "@/drizzle/schema";
import { getCourseGlobalTag } from "@/features/courses/db/cache/courses";
import { getUserProductAccessGlobalTag } from "@/features/courses/db/cache/userCourseAccess";
import { getCourseSectionGlobalTag } from "@/features/coursesSections/db/cache";
import { getLessonGlobalTag } from "@/features/lessons/db/cache/lessons";
import { getProductGlobalTag } from "@/features/products/db/cache";
import { getPurchaseGlobalTag } from "@/features/purchases/db/cache";
import { formatNumber, formatPrice } from "@/lib/formatters";
import { count, countDistinct, isNotNull, sql, sum } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { PropsWithChildren, Suspense } from "react";

export default async function AdminPage() {
  const {
    averageNetPurchasesPerCustomer,
    netPurchases,
    netSales,
    refundedPurchases,
    totalRefunds,
  } = await getPurchaseDetails();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 md:grid-cols-4 gap-4">
      <StatCard title="Net Sales">
        {formatPrice(netSales, { showZeroAsNumber: true })}
      </StatCard>
      <StatCard title="Refunded Sales">
        {formatPrice(totalRefunds, { showZeroAsNumber: true })}
      </StatCard>
      <StatCard title="Un-Refunded Purchases">
        {formatNumber(netPurchases)}
      </StatCard>
      <StatCard title="Refunded Purchases">
        {formatNumber(refundedPurchases)}
      </StatCard>
      <StatCard title="Purchases Per User">
        {formatNumber(averageNetPurchasesPerCustomer, {
          maximumFractionDigits: 2,
        })}
      </StatCard>
      <Suspense fallback={<StatCardSkeletons />}>
        <StatCard title="Students" stat={getTotalStudents()} />
        <StatCard title="Products" stat={getTotalProducts()} />
        <StatCard title="Courses" stat={getTotalCourses()} />
        <StatCard title="Course Sections" stat={getTotalCourseSections()} />
        <StatCard title="Lessons" stat={getTotalLessons()} />
      </Suspense>
    </div>
  );
}

async function StatCard({
  title,
  stat,
  children,
}: PropsWithChildren<{
  title: string;
  stat?: Promise<number>;
}>) {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="font-bold text-2xl">
          {stat ? formatNumber(await stat) : children}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}

function StatCardSkeletons() {
  return (
    <SkeletonArray amount={5}>
      <Card className="animate-pulse">
        <CardHeader className="text-center space-y-2">
          <CardDescription>
            <SkeletonText size="md" />
          </CardDescription>
          <CardTitle>
            <SkeletonText size="lg" />
          </CardTitle>
        </CardHeader>
      </Card>
    </SkeletonArray>
  );
}

async function getPurchaseDetails() {
  "use cache";
  cacheTag(getPurchaseGlobalTag());

  const data = await db
    .select({
      totalSales: sql<number>`COALESCE(${sum(
        purchases.pricePaidInCents
      )}, 0)`.mapWith(Number),
      totalPurchases: count(purchases.id),
      totalUsers: countDistinct(purchases.clerkUserId),
      isRefund: isNotNull(purchases.refundedAt),
    })
    .from(purchases)
    .groupBy((table) => table.isRefund);

  const [refundData] = data.filter((row) => row.isRefund);
  const [salesData] = data.filter((row) => !row.isRefund);

  const netSales = (salesData?.totalSales ?? 0) / 100;
  const totalRefunds = (refundData?.totalSales ?? 0) / 100;
  const netPurchases = salesData?.totalPurchases ?? 0;
  const refundedPurchases = refundData?.totalPurchases ?? 0;
  const averageNetPurchasesPerCustomer =
    salesData?.totalUsers != null && salesData.totalUsers > 0
      ? netPurchases / salesData.totalUsers
      : 0;

  return {
    netSales,
    totalRefunds,
    netPurchases,
    refundedPurchases,
    averageNetPurchasesPerCustomer,
  };
}

async function getTotalStudents() {
  "use cache";
  cacheTag(getUserProductAccessGlobalTag());

  const [data] = await db
    .select({ totalStudents: countDistinct(userCourseAccess.clerkUserId) })
    .from(userCourseAccess);

  return data?.totalStudents ?? 0;
}

async function getTotalCourses() {
  "use cache";
  cacheTag(getCourseGlobalTag());

  const [data] = await db
    .select({ totalCourses: count(courses.id) })
    .from(courses);

  return data?.totalCourses ?? 0;
}

async function getTotalProducts() {
  "use cache";
  cacheTag(getProductGlobalTag());

  const [data] = await db
    .select({ totalProducts: count(products.id) })
    .from(products);

  return data?.totalProducts ?? 0;
}

async function getTotalLessons() {
  "use cache";
  cacheTag(getLessonGlobalTag());

  const [data] = await db
    .select({ totalLessons: count(lessons.id) })
    .from(lessons);

  return data?.totalLessons ?? 0;
}

async function getTotalCourseSections() {
  "use cache";
  cacheTag(getCourseSectionGlobalTag());

  const [data] = await db
    .select({ totalCourseSections: count(courseSections.id) })
    .from(courseSections);

  return data?.totalCourseSections ?? 0;
}
