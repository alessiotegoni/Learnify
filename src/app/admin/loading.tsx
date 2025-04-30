import { SkeletonArray, SkeletonText } from "@/components/Skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="container space-y-8">
      <div className="space-y-2">
        <SkeletonText rows={2} />
      </div>

      <div className="space-y-4">
        <SkeletonText size="md" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <SkeletonArray amount={5}>
            <div className="bg-card rounded-xl border p-4 space-y-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          </SkeletonArray>
        </div>
      </div>

      <div className="space-y-4">
        <SkeletonText size="md" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <SkeletonArray amount={5}>
            <div className="bg-card rounded-xl border p-4 space-y-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          </SkeletonArray>
        </div>
      </div>
    </div>
  );
}
