"use client";

import {
  ReactNode,
  useId,
  useOptimistic,
  useTransition,
} from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { actionToast, cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";

type Props<T> = {
  items: T[];
  onOrderChange: (
    newOrder: string[]
  ) => Promise<{ error: boolean; message: string }>;
  children: (items: T[]) => ReactNode;
};

export default function SortableList<T extends { id: string }>({
  items,
  onOrderChange,
  children,
}: Props<T>) {
  const dndContextId = useId();

  const [optimisticItems, setOptimisticItems] = useOptimistic(items);
  const [_, startTransition] = useTransition();

  function handleDragEnd({ active, over }: DragEndEvent) {
    const activeId = active.id.toString();
    const overId = over?.id.toString();

    if (!activeId || !overId || activeId === overId) return;

    const fromIndex = optimisticItems.findIndex((item) => item.id === activeId);
    const toIndex = optimisticItems.findIndex((item) => item.id === overId);

    if (fromIndex === -1 || toIndex === -1) return;

    startTransition(async () => {
      const newItems = arrayMove(optimisticItems, fromIndex, toIndex);
      setOptimisticItems(newItems);

      const res = await onOrderChange(newItems.map((item) => item.id));
      if (res.error) setOptimisticItems(optimisticItems);

      actionToast(res);
    });
  }

  return (
    <DndContext id={dndContextId} onDragEnd={handleDragEnd}>
      <SortableContext
        items={optimisticItems}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-3">{children(optimisticItems)}</div>
      </SortableContext>
    </DndContext>
  );
}

export function SortableItem({
  id,
  className,
  children,
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  const {
    setNodeRef,
    isDragging,
    transform,
    transition,
    attributes,
    listeners,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex gap-1 items-center bg-background rounded-lg p-2",
        isDragging && "z-10 border shadow-md"
      )}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <GripVertical
        className="text-muted-foreground size-6 p-1"
        {...attributes}
        {...listeners}
      />
      <div className={cn("grow", className)}>{children}</div>
    </div>
  );
}
