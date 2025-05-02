import { Skeleton } from "@/components/ui/skeleton";

export default function PurchaseSuccessLoading() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="mx-auto mb-6 flex items-center justify-center">
          <Skeleton className="h-20 w-20 rounded-full" />
        </div>
        <Skeleton className="h-9 w-64 mx-auto mb-2" />
        <Skeleton className="h-6 w-96 mx-auto" />
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="relative aspect-video rounded-xl overflow-hidden bg-muted animate-pulse" />

        <div className="space-y-6">
          <div>
            <Skeleton className="h-7 w-2/3 mb-2" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5 mt-1" />
          </div>

          <div className="space-y-4">
            <Skeleton className="h-12 w-full rounded-full" />
            <Skeleton className="h-12 w-full rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
