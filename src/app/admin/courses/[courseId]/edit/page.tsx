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
import { Plus } from "lucide-react";
import PageHeader from "@/components/PageHeader";

type Props = {
  params: Promise<{ courseId: string }>;
};

export default async function EditCoursePage({ params }: Props) {
  const { courseId } = await params;

  const course = await getCourse(courseId);
  if (!course) return notFound();

  const { id, name, description, sections } = course;

  return (
    <div className="max-w-xl">
      <PageHeader
        title={course.name}
        description="Edit course details, manage sections and lessons."
      />
      <Tabs defaultValue="sections" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-11">
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="lessons">Lessons</TabsTrigger>
          <TabsTrigger value="details">Course Details</TabsTrigger>
        </TabsList>

        <TabsContent value="sections">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Sections</CardTitle>
              <SectionFormDialog
                courseId={id}
                sectionOrder={sections.length ? sections.at(-1)!.order + 1 : 0}
              >
                <DialogTrigger asChild>
                  <Button className="gap-1.5 rounded-full">
                    <Plus className="h-4 w-4" />
                    Create Section
                  </Button>
                </DialogTrigger>
              </SectionFormDialog>
            </CardHeader>
            <CardContent>
              {sections.length ? (
                <SortableSectionList courseId={courseId} sections={sections} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>
                    No sections yet. Create your first section to get started.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lessons" className="space-y-6">
          {sections.length ? (
            sections.map((section) => (
              <Card key={section.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{section.name}</CardTitle>
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
                      <Button className="gap-1.5 rounded-full">
                        <Plus className="h-4 w-4" />
                        Create Lesson
                      </Button>
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
                    <div className="text-center py-6 text-muted-foreground">
                      <p>No lessons in this section yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border">
              <p className="mb-2">No sections available</p>
              <p className="text-sm">
                Create sections first before adding lessons.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardContent className="pt-0">
              <CourseForm course={{ id, name, description }} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
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
