"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import FormRequiredLabel from "@/components/FormRequiredLabel";
import { Button } from "@/components/ui/button";
import { actionToast } from "@/lib/utils";
import { CourseSectionStatus, courseSectionStatuses } from "@/drizzle/schema";
import { sectionSchema, SectionSchemaType } from "../schemas/sections";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createSection, updateSection } from "../actions/sections";
import SelectField from "@/components/SelectField";

export default function SectionForm({
  courseId,
  section,
  sectionOrder,
  onSuccess,
}: {
  courseId: string;
  sectionOrder?: number;
  onSuccess?: () => void;
  section?: {
    id: string;
    name: string;
    status: CourseSectionStatus;
  };
}) {
  const form = useForm<SectionSchemaType>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      name: section?.name ?? "",
      status: section?.status ?? "private",
    },
  });

  async function onSubmit(data: SectionSchemaType) {
    const action = !section
      ? createSection.bind(null, sectionOrder!)
      : updateSection.bind(null, section.id);

    const res = await action(data, courseId);

    actionToast(res);
    if (!res.error) onSuccess?.();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
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

        <SelectField<SectionSchemaType> name="status" label="Status">
          {courseSectionStatuses.map((status) => (
            <SelectItem key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </SelectItem>
          ))}
        </SelectField>

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
