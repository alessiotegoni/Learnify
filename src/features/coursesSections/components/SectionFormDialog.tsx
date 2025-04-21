"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CourseSectionStatus } from "@/drizzle/schema";
import { PropsWithChildren, useState } from "react";
import SectionForm from "./SectionForm";

type Props = {
  courseId: string;
  sectionOrder?: number;
  section?: { id: string; name: string; status: CourseSectionStatus };
};
export default function SectionFormDialog({
  courseId,
  section,
  sectionOrder,
  children,
}: PropsWithChildren<Props>) {
  const [open, setIsOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      {children}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {!section ? "New Section" : `Edit Section: ${section.name}`}
          </DialogTitle>
          <div className="mt-4">
            <SectionForm
              courseId={courseId}
              section={section}
              sectionOrder={sectionOrder}
              onSuccess={() => setIsOpen(false)}
            />
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
