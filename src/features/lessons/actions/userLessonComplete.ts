"use server";

import { auth } from "@clerk/nextjs/server";
import { insertLessonComplete } from "../db/userLessonComplete";
import { canCompleteLesson } from "../permissions/userLessonComplete";

export async function saveLessonCompletion(lessonId: string) {
  const { userId, sessionClaims } = await auth();
  
  if (
    !userId ||
    !(await canCompleteLesson(
      { role: sessionClaims.role, userId },
      { id: lessonId, status: "public" }
    ))
  )
    return { error: true, message: "Error saving lesson completion" };

  await insertLessonComplete(lessonId, userId);
}
