"use client";

import Youtube, { YouTubeEvent } from "react-youtube";

type Props = {
  videoId: string;
  onFinishedVideo?: (e: YouTubeEvent<number>) => void;
};

export default function YoutubeVideoPlayer({
  videoId,
  onFinishedVideo,
}: Props) {
  return (
    <Youtube
      videoId={videoId}
      className="aspect-video rounded-lg overflow-hidden"
      opts={{ width: "100%", height: "100%" }}
      onEnd={onFinishedVideo}
    />
  );
}
