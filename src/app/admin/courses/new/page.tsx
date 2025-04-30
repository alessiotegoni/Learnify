import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import CourseForm from "@/features/courses/components/CourseForm";

export default function NewCoursePage() {
  return (
    <div className="max-w-xl mx-auto">
      <PageHeader
        title="New Course"
        description="Create a new course for your platform."
      />
      <Card>
        <CardContent className="pt-6">
          <CourseForm />
        </CardContent>
      </Card>
    </div>
  );
}
