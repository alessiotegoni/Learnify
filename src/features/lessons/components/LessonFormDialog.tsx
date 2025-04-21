"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PropsWithChildren, useState } from "react";
import LessonForm from "./LessonForm";
import { LessonStatus } from "@/drizzle/schema";

type Props = {
  courseId: string;
  defaultSectionId: string;
  sections: { id: string; name: string }[];
  lesson?: {
    name: string;
    id: string;
    description: string | null;
    order: number;
    status: LessonStatus;
    youtubeVideoId: string;
  }
  lessonOrder?: number;
};

export default function LessonFormDialog({
  courseId,
  defaultSectionId,
  sections,
  lesson,
  lessonOrder,
  children,
}: PropsWithChildren<Props>) {
  const [open, setIsOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      {children}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {!lesson ? "New Lesson" : `Edit Lesson: ${lesson.name}`}
          </DialogTitle>
          <div className="mt-4">
            <LessonForm
              sections={sections}
              courseId={courseId}
              defaultSectionId={defaultSectionId}
              lesson={lesson}
              lessonOrder={lessonOrder}
              onSuccess={() => setIsOpen(false)}
            />
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
