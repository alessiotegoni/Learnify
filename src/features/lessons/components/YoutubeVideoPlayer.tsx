"use client";

import Youtube, { YouTubeProps } from "react-youtube";
import { cn } from "@/lib/utils";
import useLessonWatchTracker from "@/hooks/useLessonWatchTracker";

type Props = {
  lesson?: {
    id: string;
    courseId: string
    isCompleted: boolean;
  };
} & YouTubeProps;

export default function YoutubeVideoPlayer({
  lesson,
  videoId,
  className,
  opts,
  ...props
}: Props) {
  const tracker = useLessonWatchTracker(lesson);

  return (
    <Youtube
      videoId={videoId}
      className={cn("aspect-video rounded-lg overflow-hidden", className)}
      opts={{ width: "100%", height: "100%", ...opts }}
      {...tracker}
      {...props}
    />
  );
}
