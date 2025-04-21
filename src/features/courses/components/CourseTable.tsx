import ActionButton from "@/components/ActionButton";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPlural } from "@/lib/formatters";
import { Trash2Icon } from "lucide-react";
import Link from "next/link";
import { deleteCourse } from "../actions/courses";
import { getCourses } from "@/app/admin/courses/page";

export default function CourseTable({
  courses,
}: {
  courses: Awaited<ReturnType<typeof getCourses>>;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            {formatPlural(courses.length, {
              singular: "Course",
              plural: "Courses",
            })}
          </TableHead>
          <TableHead>Students</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {courses.map((course) => (
          <TableRow key={course.id}>
            <TableCell>
              <div className="flex flex-col gap-1">
                <div className="font-semibold">{course.name}</div>
                <div className="text-muted-foreground">
                  {formatPlural(
                    course.sectionsCount,
                    {
                      singular: "section",
                      plural: "sections",
                    },
                    true
                  )}{" "}
                  •{" "}
                  {formatPlural(
                    course.lessonsCount,
                    {
                      singular: "lesson",
                      plural: "lessons",
                    },
                    true
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell>{course.studentsCount}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button asChild>
                  <Link href={`/admin/courses/${course.id}/edit`}>Edit</Link>
                </Button>
                <ActionButton
                  action={deleteCourse.bind(null, course.id)}
                  variant="destructive"
                  requireAreYouSure
                >
                  <Trash2Icon />
                  <span className="sr-only">Delete</span>
                </ActionButton>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
