"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, ProductSchemaType } from "../schemas/products";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FormRequiredLabel from "@/components/FormRequiredLabel";
import { Button } from "@/components/ui/button";
import { createProduct, updateProduct } from "../actions/products";
import { actionToast } from "@/lib/utils";
import SelectField from "@/components/SelectField";
import { productStatuses } from "@/drizzle/schema";
import { SelectItem } from "@/components/ui/select";
import MultipleSelector from "@/components/ui/multiselect";
import { getProduct } from "@/app/admin/products/[productId]/edit/page";

export default function ProductForm({
  courses,
  product,
}: {
  courses: { value: string; label: string }[];
  product?: Awaited<ReturnType<typeof getProduct>> & { courseIds: string[] };
}) {
  const form = useForm<ProductSchemaType>({
    resolver: zodResolver(productSchema),
    defaultValues: product ?? {
      name: "",
      description: "",
      imageUrl: "",
      status: "private",
      priceInDollars: 0,
      courseIds: [],
    },
  });

  async function onSubmit(data: ProductSchemaType) {
    const action = !product
      ? createProduct
      : updateProduct.bind(null, product.id);

    const res = await action(data);

    actionToast(res);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 items-start">
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
            name="priceInDollars"
            render={({ field }) => (
              <FormItem>
                <FormRequiredLabel label="Price" />
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    step={1}
                    min={0}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    value={isNaN(field.value) ? "" : field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormRequiredLabel label="Image Url" />
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <SelectField<ProductSchemaType> name="status" label="Status">
            {productStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </SelectItem>
            ))}
          </SelectField>

          <FormField
            control={form.control}
            name="courseIds"
            render={({ field: { value, onChange } }) => (
              <FormItem className="col-span-2">
                <FormRequiredLabel label="Select courses" />
                <FormControl>
                  <MultipleSelector
                    commandProps={{
                      label: "Select courses",
                      filter: (value, search) => {
                        const courseLabel = courses.find(
                          (c) => c.value === value
                        )?.label;

                        if (!courseLabel) return -1;

                        return courseLabel
                          .toLowerCase()
                          .includes(search.toLowerCase())
                          ? 1
                          : -1;
                      },
                    }}
                    defaultOptions={courses}
                    emptyIndicator={
                      <p className="text-center text-sm">No results found</p>
                    }
                    value={courses.filter((course) =>
                      value.includes(course.value)
                    )}
                    onChange={(newCourses) =>
                      onChange(newCourses.map((course) => course.value))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormRequiredLabel label="Description" />
                <FormControl>
                  <Textarea {...field} className="min-h-20 resize-none" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
