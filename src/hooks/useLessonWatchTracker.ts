"use client";

import { useEffect, useRef, useState } from "react";
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

  const { setLessonsInfo, getLessonPercentage } = useHandleLessons();

  const intervalRef = useRef<NodeJS.Timeout>(null);
  const debouncedSetLessonInfo = useRef<NodeJS.Timeout>(null);
  const durationRef = useRef(0);
  const savedPercent = useRef(0);

  const clear = () => {
    if (!intervalRef.current) return;

    clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  const onPlay = (e: YouTubeEvent<number>) => {
    if (!lesson || isCompleted || e.target.isMuted()) return;

    durationRef.current = e.target.getDuration();
    savedPercent.current = getLessonPercentage({
      id: lesson.id,
      courseId: lesson.courseId,
    });

    setWatchedSeconds(0);
    clear();

    intervalRef.current = setInterval(() => {
      setWatchedSeconds((prev) => prev + 1);
    }, 1000);
  };

  const onPause = clear;
  const onEnd = clear;

  const setLessonProgressDebounced = () => {
    if (debouncedSetLessonInfo.current) {
      clearTimeout(debouncedSetLessonInfo.current);
    }

    debouncedSetLessonInfo.current = setTimeout(() => {
      if (!lesson || isCompleted || !durationRef.current) return;

      const currentPercent = (watchedSeconds / durationRef.current) * 100;
      const totalPercent = Math.min(savedPercent.current + currentPercent, 100);

      setLessonsInfo({
        courseId: lesson.courseId,
        id: lesson.id,
        percent: totalPercent,
      });

      if (totalPercent >= 80 && !isCompleted) {
        setIsCompleted(true);
        saveLessonCompletion(lesson.id);
        console.log("lesson completed");
      }
    }, 1000);
  };

  useEffect(() => {
    setLessonProgressDebounced();
  }, [watchedSeconds]);

  useEffect(() => clear, []);

  return {
    onPlay,
    onPause,
    onEnd,
  };
}
