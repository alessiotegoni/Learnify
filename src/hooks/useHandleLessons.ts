"use client";

import { mapCourse } from "@/app/(consumer)/courses/[courseId]/layout";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type LessonsInfo = Record<
  string,
  { lastLesson: string; lessonsPercentage: Record<string, number> }
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

  const setLessonsInfo = useCallback(
    ({
      courseId,
      id,
      percent,
    }: {
      courseId: string;
      id: string;
      percent?: number;
    }) => {
      if (typeof id !== "string") return;

      const lessonsInfo = getLessonsInfo();

      const existingCourseInfo = lessonsInfo?.[courseId];

      const updatedCourseInfo = {
        lastLesson: id,
        lessonsPercentage: {
          ...(existingCourseInfo?.lessonsPercentage ?? {}),
          [id]:
            percent ??
            existingCourseInfo?.lessonsPercentage?.[id] ??
            0,
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

  function getLessonsInfo() {
    const lessonsInfo: LessonsInfo = JSON.parse(
      localStorage.getItem("lessonsInfo")!
    );

    return lessonsInfo;
  }

  function getLessonPercentage({
    courseId,
    id,
  }: {
    courseId: string;
    id: string;
  }) {
    const lessonsInfo = getLessonsInfo();

    return lessonsInfo?.[courseId]?.lessonsPercentage[id] ?? 0;
  }

  function getCourseLastLesson(courseId: string) {
    const lessonsInfo = getLessonsInfo();

    return lessonsInfo?.[courseId]?.lastLesson;
  }

  useEffect(() => {
    if (typeof lessonId !== "string" || !course) return;

    handleSetActiveSections();
    setLessonsParams();
    setLessonsInfo({ courseId: course.id, id: lessonId });
  }, [lessonId]);

  return {
    lessonId,
    activeSections,
    setActiveSections,
    getCourseLastLesson,
    getLessonPercentage,
    setLessonsInfo,
  };
}
