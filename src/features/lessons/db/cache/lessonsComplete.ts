import { getGlobalTag, getIdTag, getUserTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export const getUserLessonCompleteGlobalTag = () =>
  getGlobalTag("userLessonComplete");

export const getUserLessonCompleteIdTag = ({
  lessonId,
  userId,
}: {
  lessonId: string;
  userId: string;
}) => getIdTag("userLessonComplete", `lesson:${lessonId}-user:${userId}`);

export const getUserLessonCompleteUserTag = (userId: string) =>
  getUserTag("userLessonComplete", userId);

export const revalidateUserLessonCompleteCache = ({
  lessonId,
  userId,
}: {
  lessonId: string;
  userId: string;
}) => {
  revalidateTag(getUserLessonCompleteGlobalTag());
  revalidateTag(getUserLessonCompleteIdTag({ lessonId, userId }));
  revalidateTag(getUserLessonCompleteUserTag(userId));
};
