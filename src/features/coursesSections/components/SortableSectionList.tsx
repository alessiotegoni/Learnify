"use client";

import SortableList, { SortableItem } from "@/components/SortableList";
import { CourseSectionStatus } from "@/drizzle/schema";
import { cn } from "@/lib/utils";
import { Eye, EyeClosed } from "lucide-react";
import SectionFormDialog from "./SectionFormDialog";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import ActionButton from "@/components/ActionButton";
import { deleteSection, updateSectionOrders } from "../actions/sections";

type Props = {
  courseId: string;
  sections: {
    id: string;
    name: string;
    status: CourseSectionStatus;
  }[];
};

export default function SortableSectionList({ courseId, sections }: Props) {
  return (
    <SortableList items={sections} onOrderChange={updateSectionOrders}>
      {(items) =>
        items.map((section) => (
          <SortableItem key={section.id} id={section.id}>
            <div
              key={section.id}
              className="flex items-center justify-between gap-1"
            >
              <div
                className={cn(
                  "flex items-center gap-2 font-medium",
                  section.status === "private" && "text-muted-foreground"
                )}
              >
                {section.status === "private" ? (
                  <EyeClosed className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
                {section.name}
              </div>
              <div className="flex gap-2">
                <SectionFormDialog courseId={courseId} section={section}>
                  <DialogTrigger asChild>
                    <Button size="sm">Edit</Button>
                  </DialogTrigger>
                </SectionFormDialog>
                <ActionButton
                  variant="destructive"
                  action={deleteSection.bind(null, section.id, courseId)}
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
