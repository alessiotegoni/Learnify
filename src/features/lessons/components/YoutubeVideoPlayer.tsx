"use client";

import Youtube, { YouTubeProps } from "react-youtube";
import { cn } from "@/lib/utils";
import { memo } from "react";
import useVideoProgressTracker from "@/hooks/useVideoProgressTracker";

type Props = {
  lesson?: {
    id: string;
    courseId: string;
    isCompleted: boolean;
  };
} & YouTubeProps;

function YoutubeVideoPlayer({
  lesson,
  videoId,
  className,
  opts,
  ...props
}: Props) {
  const tracker = useVideoProgressTracker(lesson);

  return (
    <Youtube
      key={lesson?.id}
      videoId={videoId}
      className={cn("aspect-video rounded-lg overflow-hidden", className)}
      opts={{ width: "100%", height: "100%", ...opts }}
      {...tracker}
      {...props}
    />
  );
}

export default memo(
  YoutubeVideoPlayer,
  (prev, next) => prev.lesson?.id === next.lesson?.id
);
