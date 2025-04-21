import { getPublicProducts } from "@/app/(consumer)/page";
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
    <Card className="overflow-hidden flex flex-col w-full max-w-[500px] mx-auto pt-0">
      <div className="relative aspect-video w-full">
        <Image src={imageUrl} alt={name} fill className="object-cover" />
      </div>
      <CardHeader className="space-y-0">
        <CardDescription>
          <Suspense fallback={formatPrice(priceInDollars)}>
            <Price price={priceInDollars} />
          </Suspense>
        </CardDescription>
        <CardTitle className="text-xl">{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3">{description}</p>
      </CardContent>
      <CardFooter className="mt-auto">
        <Button className="w-full text-base py-6" asChild>
          <Link href={`/products/${id}`}>View course</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export async function Price({ price }: { price: number }) {

  const coupon = await getUserCoupon();
  if (price === 0 || !coupon) return formatPrice(price);

  return (
    <div className="flex gap-2 items-baseline">
      <div className="line-through text-xs opacity-50">
        {formatPrice(price)}
      </div>
      <div>{formatPrice(price * (1 - coupon.discountPercentage))}</div>
    </div>
  );
}
