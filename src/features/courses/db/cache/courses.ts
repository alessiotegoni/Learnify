import { getGlobalTag, getIdTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export const getCourseGlobalTag = () => getGlobalTag("courses");

export const getCourseIdTag = (id: string) => getIdTag("courses", id);

export const revalidateCourseCache = (id: string) => {
  revalidateTag(getCourseGlobalTag());
  revalidateTag(getCourseIdTag(id));
};
