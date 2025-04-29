"use client";

import useHandleLessons from "@/hooks/useHandleLessons";
import { Button } from "./ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export default function ViewCourseBtn({
  courseId,
  className,
  children,
}: {
  courseId: string;
  className?: string;
  children?: ReactNode;
}) {
  const { getCourseCurrentLesson, getLessonsInfo } = useHandleLessons();

  const isFirstWatch = () => {
    const lessonsInfo = getLessonsInfo();
    const courseLessons = Object.values(lessonsInfo?.[courseId]?.lessons ?? {});
    return !courseLessons.some((lesson) => Boolean(lesson.percent));
  };

  let href = `/courses/${courseId}`;

  const lastLessonId = getCourseCurrentLesson(courseId);
  if (lastLessonId) href += `/lessons/${lastLessonId}`;

  return (
    <Button className={cn("w-full rounded-lg h-10", className)} asChild>
      <Link href={href}>
        {children}
        {isFirstWatch() ? "Start Learning" : "Continue Learning"}
      </Link>
    </Button>
  );
}
