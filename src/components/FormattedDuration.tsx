import { formatPlural } from "@/lib/formatters";

export function FormattedDuration({ totalSeconds }: { totalSeconds: number }) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.ceil((totalSeconds % 3600) / 60);

  const hourText =
    hours > 0
      ? formatPlural(hours, { singular: "hour", plural: "hours" }, true)
      : "";
  const minuteText =
    minutes > 0
      ? formatPlural(minutes, { singular: "minute", plural: "minutes" }, true)
      : "";

  const parts = [hourText, minuteText].filter(Boolean).join(" and ");

  return parts || "0 minutes";
}
