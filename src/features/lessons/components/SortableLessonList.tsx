"use client";

import SortableList, { SortableItem } from "@/components/SortableList";
import { cn } from "@/lib/utils";
import { Eye, EyeClosed, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import ActionButton from "@/components/ActionButton";
import LessonFormDialog from "./LessonFormDialog";
import { deleteLesson, updateLessonsOrder } from "../actions/lessons";
import { LessonStatus } from "@/drizzle/schema";

type Props = {
  courseId: string;
  defaultSectionId: string;
  sections: { id: string; name: string }[];
  lessons: {
    name: string;
    id: string;
    description: string | null;
    order: number;
    status: LessonStatus;
    youtubeVideoId: string;
  }[];
};

export default function SortableLessonList({
  courseId,
  defaultSectionId,
  sections,
  lessons,
}: Props) {
  return (
    <SortableList
      items={lessons}
      onOrderChange={(newOrder) => updateLessonsOrder(newOrder, courseId)}
    >
      {(lessons) =>
        lessons.map((lesson) => (
          <SortableItem key={lesson.id} id={lesson.id}>
            <div
              key={lesson.id}
              className="flex items-center justify-between gap-1"
            >
              <div
                className={cn(
                  "flex items-center gap-2 font-medium",
                  lesson.status === "private" && "text-muted-foreground"
                )}
              >
                {lesson.status === "public" && <Eye className="size-4" />}
                {lesson.status === "private" && (
                  <EyeClosed className="size-4" />
                )}
                {lesson.status === "preview" && <Video className="size-4" />}
                {lesson.name}
              </div>
              <div className="flex gap-2">
                <LessonFormDialog
                  courseId={courseId}
                  defaultSectionId={defaultSectionId}
                  sections={sections}
                  lesson={lesson}
                >
                  <DialogTrigger asChild>
                    <Button size="sm">Edit</Button>
                  </DialogTrigger>
                </LessonFormDialog>
                <ActionButton
                  variant="destructive"
                  action={deleteLesson.bind(
                    null,
                    lesson.id,
                    defaultSectionId,
                    courseId
                  )}
                  size="sm"
                  requireAreYouSure
                >
                  Delete
                </ActionButton>
              </div>
            </div>
          </SortableItem>
        ))
      }
    </SortableList>
  );
}
