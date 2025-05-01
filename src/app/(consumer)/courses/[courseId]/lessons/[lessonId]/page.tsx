import { SkeletonText } from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import { db } from "@/drizzle/db";
import { userLessonComplete } from "@/drizzle/schema";
import YoutubeVideoPlayer from "@/features/lessons/components/YoutubeVideoPlayer";
import { getLessonIdTag } from "@/features/lessons/db/cache/lessons";
import {
  getUserLessonCompleteIdTag,
  getUserLessonCompleteUserTag,
} from "@/features/lessons/db/cache/lessonsComplete";
import { canViewLesson } from "@/features/lessons/permissions/lessons";
import { AwaitedReturn } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { and, count, eq } from "drizzle-orm";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type Props = {
  searchParams: Promise<{ previous?: string; next?: string }>;
  params: Promise<{ lessonId: string; courseId: string }>;
};

export default async function LessonPage({ params, searchParams }: Props) {
  const [{ courseId, lessonId }, lessonParams] = await Promise.all([
    params,
    searchParams,
  ]);

  const lesson = await getLesson(lessonId);
  if (!lesson) return notFound();

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <SuspenseBoundary
        courseId={courseId}
        lesson={lesson}
        searchParams={lessonParams}
      />
    </Suspense>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="aspect-video bg-muted rounded-lg animate-pulse" />
      <div className="flex justify-between items-start gap-4">
        <SkeletonText />
        <div className="flex gap-3">
          <SkeletonText rows={2} />
        </div>
      </div>
      <div className="space-y-2">
        <SkeletonText rows={3} />
      </div>
    </div>
  );
}

async function SuspenseBoundary({
  lesson,
  courseId,
  searchParams,
}: {
  lesson: AwaitedReturn<typeof getLesson>;
  courseId: string;
  searchParams: Awaited<Props["searchParams"]>;
}) {
  const { userId, sessionClaims } = await auth();

  const isLessonComplete = !userId
    ? false
    : await getIsLessonComplete(lesson.id, userId);

  const canView = await canViewLesson(
    { userId, role: sessionClaims?.role },
    lesson
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="aspect-video rounded-lg overflow-hidden">
        {canView ? (
          <YoutubeVideoPlayer
            videoId={lesson.youtubeVideoId}
            lesson={{ id: lesson.id, courseId, isCompleted: isLessonComplete }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center bg-primary/10 text-primary h-full w-full">
            <Lock className="size-16 mb-4" />
            <p className="text-lg font-medium">This lesson is locked</p>
            <p className="text-sm text-muted-foreground">
              Purchase the course to access this content
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl font-semibold">{lesson.name}</h1>
          <div className="flex justify-end gap-3">
            {searchParams.previous && (
              <Button variant="outline" className="gap-2 rounded-full" asChild>
                <Link
                  replace
                  href={`/courses/${courseId}/lessons/${searchParams.previous}`}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Link>
              </Button>
            )}
            {searchParams.next && (
              <Button variant="outline" className="gap-2 rounded-full" asChild>
                <Link
                  replace
                  href={`/courses/${courseId}/lessons/${searchParams.next}`}
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        {canView ? (
          lesson.description && (
            <div className="prose dark:prose-invert max-w-none">
              <p>{lesson.description}</p>
            </div>
          )
        ) : (
          <div className="bg-muted/50 rounded-lg p-6 text-center">
            <p className="text-muted-foreground">
              This lesson is locked. Please purchase the course to view it.
            </p>
            <Button className="mt-4 rounded-full" asChild>
              <Link href={`/#courses`}>Purchase Course</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

async function getLesson(id: string) {
  "use cache";
  cacheTag(getLessonIdTag(id));

  return db.query.lessons.findFirst({
    columns: {
      id: true,
      name: true,
      description: true,
      youtubeVideoId: true,
      courseSectionId: true,
      status: true,
    },
    where: (lessons, { eq }) => eq(lessons.id, id),
  });
}
async function getIsLessonComplete(lessonId: string, userId: string) {
  "use cache";
  cacheTag(
    getUserLessonCompleteUserTag(userId),
    getUserLessonCompleteIdTag({ lessonId, userId })
  );

  return db
    .select({ isComplete: count() })
    .from(userLessonComplete)
    .where(
      and(
        eq(userLessonComplete.clerkUserId, userId),
        eq(userLessonComplete.lessonId, lessonId)
      )
    )
    .then(([res]) => !!res?.isComplete);
}
