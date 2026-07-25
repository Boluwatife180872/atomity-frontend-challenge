"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";

interface ChapterLayerProps {
  index: number;
  chapterFloat: MotionValue<number>;
  children: React.ReactNode;
}

export function ChapterLayer({ index, chapterFloat, children }: ChapterLayerProps) {
  const distance = useTransform(chapterFloat, (v) => Math.abs(v - index));
  const opacity = useTransform(distance, [0, 0.6, 1], [1, 1, 0]);
  // as this chapter is about to be left behind, it zooms slightly before fading —
  // the "zoom into the highest, then it breaks" feel you described
  const scale = useTransform(
    chapterFloat,
    [index - 1, index - 0.3, index, index + 0.7, index + 1],
    [0.94, 1, 1, 1.12, 0.94]
  );
  // only the active-ish chapter should be able to receive focus/clicks
  const pointerEvents = useTransform(distance, (d) => (d < 0.5 ? "auto" : "none"));

  return (
    <motion.div
      style={{ opacity, scale, pointerEvents }}
      className="absolute inset-0 flex items-center justify-center"
    >
      {children}
    </motion.div>
  );
}