import { getPublicProducts } from "@/app/(consumer)/page";
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
import { formatPrice } from "@/lib/formatters";
import { getUserCoupon } from "@/lib/userCountryHeader";
import { BookOpen, Star, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

export default function ProductCard({
  id,
  name,
  description,
  imageUrl,
  priceInDollars,
}: Awaited<ReturnType<typeof getPublicProducts>>[0]) {
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
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span>12 lessons</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>1.2k students</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <Star className="h-4 w-4 fill-primary text-primary" />
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

export async function Price({ price }: { price: number }) {
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
