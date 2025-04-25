"use client";

import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { YouTubeEvent } from "react-youtube";
import { saveLessonCompletion } from "@/features/lessons/actions/userLessonComplete";
import useHandleLessons from "./useHandleLessons";

type Lesson = {
  id: string;
  courseId: string;
  isCompleted: boolean;
};

export default function useVideoProgressTracker(lesson?: Lesson) {
  const [isCompleted, setIsCompleted] = useState(lesson?.isCompleted ?? false);
  const [watchedSeconds, setWatchedSeconds] = useState(0);

  const {
    getLessonPercentage,
    saveLessonPercentage,
    getLessonCurrentTime,
    saveLessonCurrentTime,
  } = useHandleLessons();

  const intervalRef = useRef<NodeJS.Timeout>(null);
  const debouncedSetLessonInfo = useRef<NodeJS.Timeout>(null);
  const durationRef = useRef(0);
  const savedPercent = useRef(0);

  const stopTracking = () => {
    if (!intervalRef.current) return;

    clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  const setVideoCurrentTime = (e: YouTubeEvent<number>) => {
    if (!lesson) return;

    const currentTime = getLessonCurrentTime({
      courseId: lesson.courseId,
      id: lesson.id,
    });
    if (currentTime) e.target.seekTo(currentTime, true);
  };

  const trackWatchedSeconds = (e: YouTubeEvent<number>) => {
    if (!lesson || isCompleted || e.target.isMuted()) return;

    durationRef.current = e.target.getDuration();
    savedPercent.current = getLessonPercentage({
      id: lesson.id,
      courseId: lesson.courseId,
    });

    setWatchedSeconds(0);
    stopTracking();

    intervalRef.current = setInterval(() => {
      setWatchedSeconds((prev) => prev + 1);
    }, 1000);
  };

  const saveVideoCurrentTime = (e: YouTubeEvent<number>) => {
    if (!lesson) return;

    const currentTime = e.target.getCurrentTime();
    if (currentTime) {
      saveLessonCurrentTime(lesson.courseId, lesson.id, currentTime);
    }
  };

  const handleLessonPercentage = (
    lesson: Lesson,
    durationRef: RefObject<number>
  ) => {
    if (debouncedSetLessonInfo.current) {
      clearTimeout(debouncedSetLessonInfo.current);
    }

    debouncedSetLessonInfo.current = setTimeout(() => {
      const currentPercent = (watchedSeconds / durationRef.current) * 100;
      const totalPercent = Math.min(savedPercent.current + currentPercent, 100);

      saveLessonPercentage(lesson.courseId, lesson.id, totalPercent);

      if (totalPercent >= 80 && !isCompleted) {
        setIsCompleted(true);
        saveLessonCompletion(lesson.id);
        console.log("lesson completed");
      }
    }, 1000);
  };

  useEffect(() => {
    if (lesson && !isCompleted && durationRef.current) {
      handleLessonPercentage(lesson, durationRef);
    }
  }, [watchedSeconds]);

  useEffect(() => stopTracking, []);

  const onPlay = useCallback(trackWatchedSeconds, [lesson?.id, isCompleted]);
  const onPause = useCallback(stopTracking, []);
  const onEnd = useCallback(stopTracking, []);
  const onReady = useCallback(setVideoCurrentTime, [lesson?.id]);
  const onStateChange = useCallback(saveVideoCurrentTime, [lesson?.id]);

  return {
    onStateChange,
    onReady,
    onPlay,
    onPause,
    onEnd,
  };
}
