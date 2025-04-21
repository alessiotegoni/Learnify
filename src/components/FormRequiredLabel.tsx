import { cn } from "@/lib/utils";
import { AsteriskIcon } from "lucide-react";
import { ComponentPropsWithoutRef } from "react";
import { FormLabel } from "./ui/form";

export default function FormRequiredLabel({
  className,
  label,
  ...props
}: ComponentPropsWithoutRef<typeof AsteriskIcon> & { label: string }) {
  return (
    <FormLabel className="gap-1 h-5">
      {label}
      <AsteriskIcon
        {...props}
        className={cn("text-destructive inline size-4 self-start", className)}
      />
    </FormLabel>
  );
}
