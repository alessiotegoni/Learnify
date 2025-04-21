import { productStatuses } from "@/drizzle/schema";
import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
  imageUrl: z.union([
    z.string().url("Invalid url"),
    z.string().startsWith("/", "Invalid url"),
  ]),
  priceInDollars: z
    .number({ message: "Required" })
    .int()
    .nonnegative("Price must be a non negative number"),
  status: z.enum(productStatuses),
  courseIds: z.array(z.string()).min(1, "At least one course is required"),
});

export type ProductSchemaType = z.infer<typeof productSchema>;
