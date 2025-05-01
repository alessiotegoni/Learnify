import { lessonStatuses } from "@/drizzle/schema";
import { z } from "zod";

export const lessonSchema = z.object({
  courseSectionId: z.string().min(0, "required"),
  description: z
    .string()
    .nullable()
    .transform((value) => value || null),
  name: z.string().min(1, "Required"),
  status: z.enum(lessonStatuses),
  youtubeVideoId: z.string().min(1, "Required"),
  seconds: z.number().min(1, "Lesson duration must be greather then 1 second"),
});

export type LessonSchemaType = z.infer<typeof lessonSchema>;
