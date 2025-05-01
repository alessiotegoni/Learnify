import { SkeletonButton, SkeletonText } from "@/components/Skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPlural, formatPrice } from "@/lib/formatters";
import { getUserCoupon } from "@/lib/userCountryHeader";
import { BookOpen, Star, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { getPublicProducts } from "../queries/products";
import { AwaitedReturn } from "@/lib/utils";

export default function ProductCard({
  id,
  name,
  description,
  imageUrl,
  priceInDollars,
  lessonsCount,
  studentsCount,
}: AwaitedReturn<typeof getPublicProducts>[0]) {
  return (
    <Card className="group pt-0 gap-0 overflow-hidden transition-all hover:shadow-md">
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={imageUrl || "/placeholder.svg?height=720&width=1280"}
          alt={name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute top-3 right-3">
          <Suspense fallback={formatPrice(priceInDollars)}>
            <Price price={priceInDollars} />
          </Suspense>
        </div>
      </div>
      <CardHeader className="pt-4 mb-6">
        <CardTitle className="text-xl group-hover:text-primary transition-colors">
          {name}
        </CardTitle>
        <CardDescription className="text-muted-foreground line-clamp-2">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4 flex-grow">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <BookOpen className="size-4 text-muted-foreground" />
            <span>
              {formatPlural(
                lessonsCount,
                { singular: "lesson", plural: "lessons" },
                true
              )}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="size-4 text-muted-foreground" />
            <span>
              {formatPlural(
                studentsCount,
                { singular: "student", plural: "students" },
                true
              )}
            </span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <Star className="size-4 fill-primary text-primary" />
            <span>4.8</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 border-t">
        <Button className="w-full rounded-lg h-10" asChild>
          <Link href={`/products/${id}`}>View Course</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

async function Price({ price }: { price: number }) {
  const coupon = await getUserCoupon();
  if (price === 0 || !coupon) {
    return <Badge className="bg-primary"> {formatPrice(price)} </Badge>;
  }

  return (
    <Badge className="flex gap-2 items-baseline bg-primary">
      <div className="line-through text-xs opacity-50">
        {formatPrice(price)}
      </div>
      <div>{formatPrice(price * (1 - coupon.discountPercentage))}</div>
    </Badge>
  );
}

export function ProductCardSkeleton() {
  return (
    <Card className="group pt-0 gap-0 overflow-hidden">
      <div className="relative aspect-video w-full overflow-hidden bg-muted animate-pulse" />
      <CardHeader className="pt-4 mb-6">
        <SkeletonText rows={1} size="lg" />
        <SkeletonText rows={2} size="md" />
      </CardHeader>
      <CardContent className="pb-4 flex-grow">
        <div className="flex items-center gap-4 text-sm">
          <div className="h-4 w-20 bg-muted rounded animate-pulse" />
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          <div className="h-4 w-12 bg-muted rounded animate-pulse ml-auto" />
        </div>
      </CardContent>
      <CardFooter className="pt-2 border-t">
        <SkeletonButton className="w-full h-10 rounded-lg" />
      </CardFooter>
    </Card>
  );
}
