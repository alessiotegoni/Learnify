import { SkeletonArray } from "@/components/Skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/drizzle/db";
import ProductCard, {
  ProductCardSkeleton,
} from "@/features/products/components/ProductCard";
import { getProductGlobalTag } from "@/features/products/db/cache";
import { SignedIn } from "@clerk/nextjs";
import { BookOpen, Star, Users } from "lucide-react";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

export default function HomePage() {
  return (
    <>
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-r from-primary/10 rounded-lg
        to-background z-0"
        ></div>
        <div className="container !pt-8 relative z-10">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <Badge className="px-3 py-1 text-sm" variant="secondary">
                  Premium Learning Platform
                </Badge>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Expand Your Knowledge with Learnify
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Access high-quality courses taught by industry experts and
                  take your skills to the next level.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="rounded-full">
                  <Link href="#courses">Browse Courses</Link>
                </Button>
                <SignedIn>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="rounded-full"
                  >
                    <Link href="/courses">My Learning</Link>
                  </Button>
                </SignedIn>
              </div>
              <div className="flex items-center gap-4 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="inline-block rounded-full overflow-hidden border-2 border-background w-8 h-8 bg-primary/20"
                    >
                      <span className="sr-only">User {i}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span className="font-medium">4.9</span>
                  <span className="text-muted-foreground">(2.5k+ reviews)</span>
                </div>
              </div>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-background/0 z-10 rounded-xl"></div>
              <Image
                src="/imgs/learnify-banner.png"
                alt="Students learning online"
                width={1280}
                height={720}
                className="object-cover w-full h-full"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section id="courses" className="py-12 md:py-24">
        <div className="container !pt-8">
          <h2 className="text-3xl font-bold tracking-tight">
            Featured Courses
          </h2>
          <p className="text-muted-foreground mt-2 mb-10">
            Discover our most popular and highly-rated courses
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Suspense
              fallback={
                <SkeletonArray amount={3}>
                  <ProductCardSkeleton />
                </SkeletonArray>
              }
            >
              <PublicProductsList />
            </Suspense>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-24 bg-muted/50">
        <div className="container !pt-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold tracking-tight">
              Why Choose Learnify?
            </h2>
            <p className="text-muted-foreground mt-2">
              Our platform offers a premium learning experience with features
              designed to help you succeed
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <BookOpen className="h-10 w-10 text-primary" />,
                title: "Expert-Led Courses",
                description:
                  "Learn from industry professionals with real-world experience and proven expertise.",
              },
              {
                icon: <Users className="h-10 w-10 text-primary" />,
                title: "Community Support",
                description:
                  "Join a community of learners and get help whenever you need it.",
              },
              {
                icon: <Star className="h-10 w-10 text-primary" />,
                title: "High-Quality Content",
                description:
                  "Our courses are carefully crafted to provide the best learning experience.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center p-6 rounded-xl bg-card shadow-sm"
              >
                <div className="p-3 rounded-full bg-primary/10 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

async function PublicProductsList() {
  const products = await getPublicProducts();

  return products.map((product) => (
    <ProductCard key={product.id} {...product} />
  ));
}

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
