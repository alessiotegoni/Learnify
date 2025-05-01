"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import useHandleLessons from "@/hooks/useHandleLessons";
import { mapCourse } from "@/lib/mapCourse";
import { cn } from "@/lib/utils";
import { CheckCircle2, Video } from "lucide-react";
import Link from "next/link";

export default function CoursePageClient({
  course,
}: {
  course: ReturnType<typeof mapCourse>;
}) {
  const { lessonId, activeSections, setActiveSections } =
    useHandleLessons(course);

  return (
    <Accordion
      type="multiple"
      value={activeSections}
      onValueChange={setActiveSections}
    >
      {course.sections.map((section) => (
        <AccordionItem key={section.id} value={section.id}>
          <AccordionTrigger className="text-lg">
            {section.name}
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-1">
            {section.lessons.map((lesson) => (
              <Button
                variant="ghost"
                asChild
                key={lesson.id}
                className={cn(
                  "justify-start",
                  lesson.id === lessonId &&
                    "bg-accent/75 text-accent-foreground"
                )}
              >
                <Link href={`/courses/${course.id}/lessons/${lesson.id}`}>
                  <Video />
                  {lesson.name}
                  {lesson.isComplete && <CheckCircle2 className="ml-auto" />}
                </Link>
              </Button>
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
