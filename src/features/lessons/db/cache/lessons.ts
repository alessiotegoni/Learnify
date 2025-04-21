import { getCourseTag, getGlobalTag, getIdTag } from "@/lib/dataCache"
import { revalidateTag } from "next/cache"

export const getLessonGlobalTag = () =>
  getGlobalTag("lessons")

export const getLessonIdTag = (id: string) =>
  getIdTag("lessons", id)

export const getLessonCourseTag = (courseId: string) =>
  getCourseTag("lessons", courseId)

export const revalidateLessonCache = ({
  id,
  courseId,
}: {
  id: string
  courseId: string
}) => {
  revalidateTag(getLessonGlobalTag())
  revalidateTag(getLessonIdTag(id))
  revalidateTag(getLessonCourseTag(courseId))
}
