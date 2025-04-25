"use client";

import { getUserCourses } from "@/app/(consumer)/courses/page";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useHandleLessons from "@/hooks/useHandleLessons";
import { formatPlural } from "@/lib/formatters";
import { AwaitedReturn } from "@/lib/utils";
import Link from "next/link";

export default function CourseCard({
  id,
  name,
  description,
  sectionsCount,
  lessonsCount,
  completedLessonsCount,
}: AwaitedReturn<typeof getUserCourses>[0]) {
  return (
    <Card key={id} className="overflow-hidden flex flex-col pb-0">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>
          {formatPlural(
            sectionsCount,
            {
              plural: "sections",
              singular: "section",
            },
            true
          )}{" "}
          •{" "}
          {formatPlural(
            lessonsCount,
            {
              plural: "lessons",
              singular: "lesson",
            },
            true
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="line-clamp-3" title={description}>
        {description}
      </CardContent>
      <div className="grow" />
      <CardFooter>
        <ViewCourseBtn courseId={id} />
      </CardFooter>
      {lessonsCount && (
        <div
          className="bg-blue-300 h-2 -mt-2"
          style={{
            width: `${(completedLessonsCount / lessonsCount) * 100}%`,
          }}
        />
      )}
    </Card>
  );
}

function ViewCourseBtn({ courseId }: { courseId: string }) {
  const { getCourseLastLesson } = useHandleLessons();

  let href = `/courses/${courseId}`;

  const lastLessonId = getCourseLastLesson(courseId);
  if (lastLessonId) href += `/lessons/${lastLessonId}`;

  return (
    <Button asChild>
      <Link href={href}>View Course</Link>
    </Button>
  );
}
