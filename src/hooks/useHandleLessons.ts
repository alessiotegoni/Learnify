"use client";

import { mapCourse } from "@/app/(consumer)/courses/[courseId]/layout";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type LessonsInfo = Record<
  string,
  {
    currentLesson: string;
    lessons: Record<string, { percent: number; currentTime: number }>;
  }
> | null;

export default function useHandleLessons(
  course?: ReturnType<typeof mapCourse>
) {
  const [activeSections, setActiveSections] = useState<string[] | undefined>();

  const { lessonId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const lessonsIds = useMemo(() => {
    if (!lessonId || !course) return [];

    return course.sections.flatMap((section) =>
      section.lessons.map((lesson) => lesson.id)
    );
  }, [course]);

  const currentLessonIndex = useMemo(
    () => lessonsIds.findIndex((id) => id === lessonId),
    [lessonsIds, lessonId]
  );

  const handleSetActiveSections = useCallback(() => {
    if (!course) return;

    const getActiveSectionId = () =>
      course.sections.find((section) =>
        section.lessons.some((lesson) => lesson.id === lessonId)
      )?.id;

    const sectionId =
      typeof lessonId === "string"
        ? getActiveSectionId()
        : course.sections[0]?.id;

    setActiveSections(sectionId ? [sectionId] : undefined);
  }, [lessonId, course]);

  const setLessonsParams = useCallback(() => {
    const params = new URLSearchParams(searchParams);

    const previous = lessonsIds[currentLessonIndex - 1];
    if (previous) params.set("previous", previous);
    else params.delete("previous");

    const next = lessonsIds[currentLessonIndex + 1];
    if (next) params.set("next", next);
    else params.delete("next");

    router.replace(`?${params.toString()}`);
  }, [lessonsIds, currentLessonIndex]);

  const saveLessonsInfo = useCallback(
    ({
      courseId,
      id,
      percent,
      currentTime,
    }: {
      courseId: string;
      id: string;
      percent?: number;
      currentTime?: number;
    }) => {
      if (typeof id !== "string") return;

      const lessonsInfo = getLessonsInfo();

      const existingCourseInfo = lessonsInfo?.[courseId];

      const updatedCourseInfo = {
        currentLesson: id,
        lessons: {
          ...(existingCourseInfo?.lessons ?? {}),
          [id]: {
            percent: percent ?? existingCourseInfo?.lessons?.[id]?.percent ?? 0,
            currentTime:
              currentTime ??
              existingCourseInfo?.lessons?.[id]?.currentTime ??
              0,
          },
        },
      };

      const updatedLessonInfo: LessonsInfo = {
        ...(lessonsInfo ?? {}),
        [courseId]: updatedCourseInfo,
      };

      localStorage.setItem("lessonsInfo", JSON.stringify(updatedLessonInfo));
    },
    [lessonId, course?.id]
  );

  const getLessonsInfo = useCallback(() => {
    const lessonsInfo: LessonsInfo = JSON.parse(
      localStorage.getItem("lessonsInfo")!
    );

    return lessonsInfo;
  }, []);

  const getLessonPercentage = useCallback(
    ({ courseId, id }: { courseId: string; id: string }) => {
      const lessonsInfo = getLessonsInfo();

      return lessonsInfo?.[courseId]?.lessons?.[id]?.percent ?? 0;
    },
    []
  );

  const saveLessonPercentage = useCallback(
    (courseId: string, id: string, percent: number) => {
      saveLessonsInfo({ courseId, id, percent });
    },
    []
  );

  const getLessonCurrentTime = useCallback(
    ({ courseId, id }: { courseId: string; id: string }) => {
      const lessonsInfo = getLessonsInfo();

      return lessonsInfo?.[courseId]?.lessons?.[id]?.currentTime ?? 0;
    },
    []
  );

  const saveLessonCurrentTime = useCallback(
    (courseId: string, id: string, currentTime: number) => {
      saveLessonsInfo({ courseId, id, currentTime });
    },
    []
  );

  const getCourseCurrentLesson = useCallback((courseId: string) => {
    const lessonsInfo = getLessonsInfo();

    return lessonsInfo?.[courseId]?.currentLesson;
  }, []);

  useEffect(() => {
    if (typeof lessonId !== "string" || !course) return;

    handleSetActiveSections();
    setLessonsParams();
    saveLessonsInfo({ courseId: course.id, id: lessonId });
  }, [lessonId]);

  return {
    lessonId,
    activeSections,
    setActiveSections,
    getLessonsInfo,
    getCourseCurrentLesson,
    getLessonPercentage,
    saveLessonPercentage,
    getLessonCurrentTime,
    saveLessonCurrentTime,
  };
}
