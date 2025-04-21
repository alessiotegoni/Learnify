import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type Props = {
  title: string;
  className?: string
  children?: ReactNode;
};

export default function PageHeader({ title, className, children }: Props) {
  return (
    <div className={cn("mb-8 flex gap-4 items-center justify-between", className)}>
      <h1 className="text-2xl font-semibold">{title}</h1>
      {children && <div>{children}</div>}
    </div>
  );
}
