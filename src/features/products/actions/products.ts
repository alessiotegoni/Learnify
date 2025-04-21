"use server";

import { redirect } from "next/navigation";
import {
  insertProduct,
  updateProduct as updateProductDb,
  deleteProduct as deleteProductDb,
} from "../db/products";
import { productSchema, ProductSchemaType } from "../schemas/products";
import { isAdmin } from "@/services/clerk";

export async function createProduct(values: ProductSchemaType) {
  const { data, success } = productSchema.safeParse(values);

  if (!success || !(await isAdmin()))
    return { error: true, message: "Error creating your product" };

  await insertProduct(data);

  redirect("/admin/products");
}

export async function updateProduct(id: string, values: ProductSchemaType) {
  const { data, success } = productSchema.safeParse(values);

  if (!success || !(await isAdmin()))
    return { error: true, message: "Error updating your product" };

  await updateProductDb(data, id);

  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  if (!(await isAdmin()))
    return { error: true, message: "Error deleting your product" };

  await deleteProductDb(id);

  return { error: false, message: "Succesfully deleted your product" };
}
