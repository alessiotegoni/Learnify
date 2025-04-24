import { SkeletonButton, SkeletonText } from "@/components/Skeleton";

export default function LessonLoading() {
  return (
    <div className="my-4 flex flex-col gap-4">
      <div className="aspect-video bg-secondary rounded-lg animate-pulse" />
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start gap-4 mt-4">
          <SkeletonText size="lg" />
          <div className="flex justify-end gap-3">
            <SkeletonButton />
            <SkeletonButton />
          </div>
        </div>
      </div>
      <SkeletonText rows={3} />
    </div>
  );
}
