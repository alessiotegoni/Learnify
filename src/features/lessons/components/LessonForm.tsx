import { useForm } from "react-hook-form";
import { lessonSchema, LessonSchemaType } from "../schemas/lessons";
import { zodResolver } from "@hookform/resolvers/zod";
import { createLesson, updateLesson } from "../actions/lessons";
import { actionToast } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import FormRequiredLabel from "@/components/FormRequiredLabel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { lessonStatuses } from "@/drizzle/schema";
import { ComponentPropsWithoutRef } from "react";
import LessonFormDialog from "./LessonFormDialog";
import YoutubeVideoPlayer from "./YoutubeVideoPlayer";
import SelectField from "@/components/SelectField";

export default function LessonForm({
  sections,
  courseId,
  defaultSectionId,
  lesson,
  lessonOrder,
  onSuccess,
}: ComponentPropsWithoutRef<typeof LessonFormDialog> & {
  onSuccess?: () => void;
}) {
  const form = useForm<LessonSchemaType>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      courseSectionId: defaultSectionId,
      name: lesson?.name ?? "",
      description: lesson?.description || null,
      status: lesson?.status ?? "private",
      youtubeVideoId: lesson?.youtubeVideoId ?? "",
    },
  });

  async function onSubmit(data: LessonSchemaType) {
    const action = !lesson
      ? createLesson.bind(null, lessonOrder!)
      : updateLesson.bind(null, lesson.id);

    const res = await action(data, courseId);

    actionToast(res);
    onSuccess?.();
  }

  const videoId = form.watch("youtubeVideoId");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4 "
      >
        {!!videoId && <YoutubeVideoPlayer videoId={videoId} />}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormRequiredLabel label="Name" />
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="youtubeVideoId"
          render={({ field }) => (
            <FormItem>
              <FormRequiredLabel label="Youtube Video Id" />
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <SelectField<LessonSchemaType> name="courseSectionId" label="Section">
          {sections.map((section) => (
            <SelectItem value={section.id}>{section.name}</SelectItem>
          ))}
        </SelectField>

        <SelectField<LessonSchemaType> name="status" label="Status">
          {lessonStatuses.map((status) => (
            <SelectItem value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </SelectItem>
          ))}
        </SelectField>

        <FormField
          control={form.control}
          name="description"
          render={({ field: { value, ...restField } }) => (
            <FormItem>
              <FormRequiredLabel label="Description" />
              <FormControl>
                <Textarea
                  value={value ?? ""}
                  {...restField}
                  className="min-h-20 resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          className="self-end"
          disabled={form.formState.isSubmitting}
          type="submit"
        >
          Save
        </Button>
      </form>
    </Form>
  );
}
