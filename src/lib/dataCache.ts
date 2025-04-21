type CACHE_TAG =
  | "products"
  | "users"
  | "courses"
  | "userProductAccess"
  | "courseSections"
  | "lessons"
  | "purchases"
  | "userLessonComplete";

export const getGlobalTag = (tag: CACHE_TAG) => `global:${tag}` as const;

export const getIdTag = (tag: CACHE_TAG, id: string) =>
  `id:${id}-${tag}` as const;

export const getUserTag = (tag: CACHE_TAG, userId: string) =>
  `user:${userId}-${tag}` as const;

export const getCourseTag = (tag: CACHE_TAG, courseId: string) =>
  `course:${courseId}-${tag}` as const;
