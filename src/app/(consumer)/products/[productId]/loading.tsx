import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonArray } from "@/components/Skeleton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

export default function ProductLoading() {
  return (
    <div className="container grid md:grid-cols-3 gap-10">
      <div className="md:col-span-2 space-y-8">
        {/* Product title and description */}
        <div>
          <Skeleton className="h-9 w-3/4 mb-2" />
          <Skeleton className="h-6 w-full mb-1" />
          <Skeleton className="h-6 w-2/3 mb-4" />

          <div className="flex flex-wrap gap-4 items-center">
            <SkeletonArray amount={4}>
              <div className="flex items-center gap-1.5">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
            </SkeletonArray>
          </div>
        </div>

        {/* Product image */}
        <div className="aspect-video relative rounded-xl overflow-hidden bg-muted animate-pulse" />

        {/* Course content */}
        <div className="space-y-6">
          <Skeleton className="h-8 w-40" />
          <div className="grid grid-cols-1 gap-6">
            <SkeletonArray amount={2}>
              <Card className="overflow-hidden">
                <CardHeader className="pb-3">
                  <Skeleton className="h-6 w-1/3 mb-1" />
                  <Skeleton className="h-4 w-1/4" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <SkeletonArray amount={3}>
                      <div className="border rounded-lg px-4 py-4 space-y-2">
                        <div className="flex flex-col items-start text-left">
                          <Skeleton className="h-5 w-1/3 mb-1" />
                          <Skeleton className="h-4 w-1/4" />
                        </div>
                      </div>
                    </SkeletonArray>
                  </div>
                </CardContent>
              </Card>
            </SkeletonArray>
          </div>
        </div>
      </div>

      {/* Pricing card */}
      <div className="md:col-span-1">
        <div className="sticky top-20">
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <Skeleton className="h-8 w-28" />
            </CardHeader>
            <CardContent className="pb-3">
              <ul className="space-y-3">
                <SkeletonArray amount={4}>
                  <li className="flex items-start gap-2">
                    <Skeleton className="h-5 w-5 rounded-full flex-shrink-0 mt-0.5" />
                    <Skeleton className="h-5 w-full" />
                  </li>
                </SkeletonArray>
              </ul>
            </CardContent>
            <CardFooter className="pt-3">
              <Skeleton className="h-12 w-full rounded-full" />
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
