import { clsx, type ClassValue } from "clsx";
import { ExternalToast, toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function actionToast(
  { error, message }: { error: boolean; message: string },
  toastData?: ExternalToast
) {
  const variant = error ? "error" : "success";

  return toast[variant](message, toastData);
}

export type AwaitedReturn<T extends (...args: unknown[]) => unknown> =
  NonNullable<Awaited<ReturnType<T>>>;
