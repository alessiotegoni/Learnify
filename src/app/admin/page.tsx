import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  BarChart3,
  BookOpen,
  GraduationCap,
  LayoutList,
  Package,
  Receipt,
  Users,
} from "lucide-react";
import { count, countDistinct, isNotNull, sql, sum } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { type PropsWithChildren, Suspense } from "react";
import { SkeletonArray } from "@/components/Skeleton";

export default async function AdminPage() {
  const {
    averageNetPurchasesPerCustomer,
    netPurchases,
    netSales,
    refundedPurchases,
    totalRefunds,
  } = await getPurchaseDetails();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your platform's performance and statistics.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Sales Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Net Sales"
            icon={<Receipt className="size-5 text-primary" />}
          >
            {formatPrice(netSales, { showZeroAsNumber: true })}
          </StatCard>
          <StatCard
            title="Refunded Sales"
            icon={<Receipt className="size-5 text-yellow-500" />}
          >
            {formatPrice(totalRefunds, { showZeroAsNumber: true })}
          </StatCard>
          <StatCard
            title="Purchases"
            icon={<BarChart3 className="size-5 text-primary" />}
          >
            {formatNumber(netPurchases)}
          </StatCard>
          <StatCard
            title="Refunded"
            icon={<BarChart3 className="size-5 text-yellow-500" />}
          >
            {formatNumber(refundedPurchases)}
          </StatCard>
          <StatCard
            title="Purchases Per User"
            icon={<Users className="size-5 text-primary" />}
          >
            {formatNumber(averageNetPurchasesPerCustomer, {
              maximumFractionDigits: 2,
            })}
          </StatCard>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Platform Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Suspense
            fallback={
              <SkeletonArray amount={5}>
                <StatCardSkeleton />
              </SkeletonArray>
            }
          >
            <StatCard
              title="Students"
              icon={<Users className="size-5 text-primary" />}
              stat={getTotalStudents()}
            />
            <StatCard
              title="Products"
              icon={<Package className="size-5 text-primary" />}
              stat={getTotalProducts()}
            />
            <StatCard
              title="Courses"
              icon={<BookOpen className="size-5 text-primary" />}
              stat={getTotalCourses()}
            />
            <StatCard
              title="Course Sections"
              icon={<LayoutList className="size-5 text-primary" />}
              stat={getTotalCourseSections()}
            />
            <StatCard
              title="Lessons"
              icon={<GraduationCap className="size-5 text-primary" />}
              stat={getTotalLessons()}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

async function StatCard({
  title,
  icon,
  stat,
  children,
}: PropsWithChildren<{
  title: string;
  icon?: React.ReactNode;
  stat?: Promise<number>;
}>) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {stat ? formatNumber(await stat) : children}
        </div>
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="size-5 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-24" />
      </CardContent>
    </Card>
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
