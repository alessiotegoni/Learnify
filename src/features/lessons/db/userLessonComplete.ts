import { db } from "@/drizzle/db";
import { userLessonComplete } from "@/drizzle/schema";
import { revalidateUserLessonCompleteCache } from "./cache/lessonsComplete";

export async function insertLessonComplete(
  lessonId: string,
  clerkUserId: string
) {
  const { rowCount } = await db
    .insert(userLessonComplete)
    .values({ lessonId, clerkUserId })
    .onConflictDoNothing();

  if (!rowCount) throw new Error(`Error completing lesson: ${lessonId}`);

  revalidateUserLessonCompleteCache({ lessonId, userId: clerkUserId });
}
