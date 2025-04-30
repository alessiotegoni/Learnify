import { Button } from "@/components/ui/button";
import CourseTable from "@/features/courses/components/CourseTable";
import Link from "next/link";
import { Plus } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { getCourses } from "@/features/courses/queries/courses";

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <>
      <PageHeader
        title="Courses"
        description="Manage your courses, sections, and lessons."
      >
        <Button asChild className="gap-1.5 rounded-full">
          <Link href="/admin/courses/new">
            <Plus className="size-4" />
            Create Course
          </Link>
        </Button>
      </PageHeader>
      <div className="rounded-xl border overflow-hidden bg-card">
        <CourseTable courses={courses} />
      </div>
    </>
  );
}
