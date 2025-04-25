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
import { Lock } from "lucide-react";
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
  return null;
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
    <div className="my-4 flex flex-col gap-4">
      <div className="aspect-video rounded-lg">
        {canView ? (
          <YoutubeVideoPlayer
            videoId={lesson.youtubeVideoId}
            lesson={{ id: lesson.id, courseId, isCompleted: isLessonComplete }}
          />
        ) : (
          <div className="flex items-center justify-center bg-primary text-primary-foreground h-full w-full">
            <Lock className="size-16" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start gap-4 mt-4">
          <h1 className="text-2xl font-semibold">{lesson.name}</h1>
          <div className="flex justify-end gap-3">
            {searchParams.previous && (
              <Button variant="outline" asChild>
                <Link
                  replace
                  href={`/courses/${courseId}/lessons/${searchParams.previous}`}
                >
                  Previous
                </Link>
              </Button>
            )}
            {searchParams.next && (
              <Button variant="outline" asChild>
                <Link
                  replace
                  href={`/courses/${courseId}/lessons/${searchParams.next}`}
                >
                  Next
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
      {canView ? (
        lesson.description && <p>{lesson.description}</p>
      ) : (
        <p>This lesson is locked. Please purchase the course to view it.</p>
      )}
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
