export function mapCourse(
  course: {
    name: string;
    id: string;
    sections: {
      name: string;
      id: string;
      lessons: {
        name: string;
        id: string;
      }[];
    }[];
  },
  completedLessonIds: string[]
) {
  return {
    ...course,
    sections: course.sections.map((section) => ({
      ...section,
      lessons: section.lessons.map((lesson) => ({
        ...lesson,
        isComplete: completedLessonIds.includes(lesson.id),
      })),
    })),
  };
}
