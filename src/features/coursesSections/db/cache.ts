import { getCourseTag, getGlobalTag, getIdTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export const getCourseSectionGlobalTag = () => getGlobalTag("courseSections");

export const getCourseSectionIdTag = (id: string) =>
  getIdTag("courseSections", id);

export const getCourseSectionCourseTag = (courseId: string) =>
  getCourseTag("courseSections", courseId);

export const revalidateCourseSectionCache = ({
  id,
  courseId,
}: {
  id: string;
  courseId: string;
}) => {
  revalidateTag(getCourseSectionGlobalTag());
  revalidateTag(getCourseSectionIdTag(id));
  revalidateTag(getCourseSectionCourseTag(courseId));
};
