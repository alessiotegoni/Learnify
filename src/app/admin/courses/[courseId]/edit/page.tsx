import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/drizzle/db";
import CourseForm from "@/features/courses/components/CourseForm";
import { getCourseIdTag } from "@/features/courses/db/cache/courses";
import SectionFormDialog from "@/features/coursesSections/components/SectionFormDialog";
import SortableSectionList from "@/features/coursesSections/components/SortableSectionList";
import { getCourseSectionCourseTag } from "@/features/coursesSections/db/cache";
import LessonFormDialog from "@/features/lessons/components/LessonFormDialog";
import SortableLessonList from "@/features/lessons/components/SortableLessonList";
import { getLessonCourseTag } from "@/features/lessons/db/cache/lessons";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ courseId: string }>;
};

export default async function EditCoursePage({ params }: Props) {
  const { courseId } = await params;

  const course = await getCourse(courseId);

  if (!course) return notFound();

  const { id, name, description, sections } = course;

  return (
    <>
      <PageHeader title={course.name} />
      <Tabs defaultValue="sections">
        <TabsList>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="lessons">Lessons</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        <TabsContent value="sections">
          <Card>
            <CardHeader className="flex items-center justify-between flex-row">
              <CardTitle className="text-xl">Sections</CardTitle>
              <SectionFormDialog
                courseId={id}
                sectionOrder={sections.length ? sections.at(-1)!.order + 1 : 0}
              >
                <DialogTrigger asChild>
                  <Button>Create Section</Button>
                </DialogTrigger>
              </SectionFormDialog>
            </CardHeader>
            <CardContent>
              {sections.length ? (
                <SortableSectionList courseId={courseId} sections={sections} />
              ) : (
                <p className="font-medium mt-3">No sections yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="lessons" className="space-y-4">
          {sections.length ? (
            sections.map((section) => (
              <Card key={section.id}>
                <CardHeader className="flex items-center justify-between flex-row">
                  <CardTitle className="text-xl">{section.name}</CardTitle>
                  <LessonFormDialog
                    courseId={id}
                    defaultSectionId={section.id}
                    sections={sections}
                    lessonOrder={
                      section.lessons.length
                        ? section.lessons.at(-1)!.order + 1
                        : 0
                    }
                  >
                    <DialogTrigger asChild>
                      <Button>Create Lesson</Button>
                    </DialogTrigger>
                  </LessonFormDialog>
                </CardHeader>
                <CardContent>
                  {section.lessons.length ? (
                    <SortableLessonList
                      courseId={id}
                      defaultSectionId={section.id}
                      sections={sections}
                      lessons={section.lessons}
                    />
                  ) : (
                    <p className="font-medium mt-3">No lessons yet</p>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="font-medium mt-3">No sections yet</p>
          )}
        </TabsContent>
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CourseForm course={{ id, name, description }} />
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

async function getCourse(id: string) {
  "use cache";
  cacheTag(
    getCourseIdTag(id),
    getCourseSectionCourseTag(id),
    getLessonCourseTag(id)
  );

  return db.query.courses.findFirst({
    columns: { id: true, name: true, description: true },
    where: ({ id: courseId }, { eq }) => eq(courseId, id),
    with: {
      sections: {
        columns: { id: true, status: true, name: true, order: true },
        orderBy: ({ order }, { asc }) => asc(order),
        with: {
          lessons: {
            columns: {
              courseSectionId: false,
              createdAt: false,
              updatedAt: false,
            },
            orderBy: ({ order }, { asc }) => asc(order),
          },
        },
      },
    },
  });
}
