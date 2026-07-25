"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useHeroPath } from "@/hooks/useHeroPath";
import { LevelBars } from "./LevelBars";
import { LevelMetricTable } from "./LevelMetricTable";
import { Card } from "@/components/ui/Card";
import {
  getClusterItems,
  getNamespaceItems,
  getPodItems,
  getResourceItems,
  getClusterPodsMap,
  type DrillItem,
} from "@/lib/drill";
import { formatCurrency } from "@/lib/format";

const CHAPTER_COUNT = 4;
const VH_PER_CHAPTER = 145;

function ApiResourceUnfold({ items, progress }: { items: DrillItem[]; progress: number }) {
  const revealProgress = Math.max(0, Math.min(progress / 0.6, 1));
  const splitProgress = Math.max(0, Math.min((progress - 0.45) / 0.55, 1));
  const maxTotal = Math.max(...items.map((item) => item.total), 1);
  const bodyOpacity = Math.max(0, Math.min((progress - 0.12) / 0.18, 1));

  return (
    <motion.div
      className="w-full"
      initial={false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative h-72 overflow-hidden rounded-xl">
        <motion.div
          className="absolute left-[10%] top-1/2 h-28 origin-left -translate-y-1/2 overflow-hidden rounded-lg bg-accent-primary shadow-[0_18px_60px_rgba(80,210,141,0.26)]"
          animate={{
            width: `${14 + revealProgress * 76}%`,
            opacity: 1 - splitProgress * 0.92,
            scaleY: 1 + Math.sin(revealProgress * Math.PI) * 0.08,
          }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />

        <div className="absolute inset-x-[10%] top-1/2 -translate-y-1/2">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-lg bg-white/10"
            animate={{ width: `${14 + revealProgress * 76}%`, opacity: bodyOpacity }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        <div className="absolute inset-x-[10%] top-1/2 -translate-y-1/2">
          {items.map((item, index) => {
            const height = 56 + (item.total / maxTotal) * 72;
            const offset = (index - (items.length - 1) / 2) * 10;
            const laneLeft = 10 + index * 17.2;

            return (
              <motion.div
                key={item.id}
                className="absolute top-1/2 w-[16%] -translate-y-1/2"
                initial={false}
                animate={{
                  left: `${laneLeft}%`,
                  opacity: splitProgress,
                  y: (1 - splitProgress) * offset,
                  scaleX: 0.92 + splitProgress * 0.08,
                  scaleY: 0.95 + splitProgress * 0.05,
                }}
                transition={{ duration: 0.9, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.div
                  className="relative mx-auto flex w-full flex-col justify-end overflow-hidden rounded-lg border border-white/35 bg-accent-primary shadow-[0_14px_40px_rgba(80,210,141,0.2)]"
                  animate={{ height, width: `${92 + index * 2}%` }}
                  transition={{ duration: 1, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
                >
                  <motion.div
                    className="absolute inset-0 bg-white/10"
                    animate={{ opacity: bodyOpacity }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  />
                  <motion.div
                    className="absolute inset-x-0 top-0 h-px bg-white/70"
                    animate={{ opacity: splitProgress }}
                  />
                  <motion.div
                    className="absolute inset-y-0 right-0 w-px bg-white/55"
                      animate={{ opacity: index < items.length - 1 ? splitProgress : 0 }}
                  />
                  <motion.div
                    className="absolute left-3 top-3 text-left"
                    animate={{ opacity: Math.max(0, (splitProgress - 0.1) / 0.9) }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/80">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-white/70">{formatCurrency(item.total)}</p>
                  </motion.div>
                </motion.div>
                <motion.div
                  className="mt-2 text-center"
                  animate={{ opacity: Math.max(0, (splitProgress - 0.18) / 0.82), y: splitProgress ? 0 : -6 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  <p className="text-sm font-semibold text-text-primary">{item.name}</p>
                  <p className="text-xs text-text-secondary">{formatCurrency(item.total)}</p>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function ChapterDot({
  index,
  chapterFloat,
  onClick,
}: {
  index: number;
  chapterFloat: MotionValue<number>;
  onClick: () => void;
}) {
  const opacity = useTransform(chapterFloat, (v) => (Math.round(v) === index ? 1 : 0.35));
  return (
    <motion.button
      style={{ opacity }}
      onClick={onClick}
      aria-label={`Jump to chapter ${index + 1}`}
      className="w-2 h-2 rounded-full bg-accent-primary"
    />
  );
}

export function ScrollDrillSection() {
  const { data, isLoading, isError, error } = useDashboardData();
  const heroPath = useHeroPath(data);
  const [stage, setStage] = useState(0);
  const [focusMode, setFocusMode] = useState(false);
  const [storyProgress, setStoryProgress] = useState(0);

  const trackRef = useRef<HTMLElement>(null);
  const scrollProgress = useMotionValue(0);

  const chapterFloat = useTransform(scrollProgress, [0, 1], [0, CHAPTER_COUNT - 1]);

  useEffect(() => {
    let frame = 0;

    function updateFromScroll() {
      frame = 0;
      const track = trackRef.current;
      if (!track) return;

      const rect = track.getBoundingClientRect();
      const scrollableDistance = Math.max(track.offsetHeight - window.innerHeight, 1);
      const progress = Math.min(Math.max(-rect.top / scrollableDistance, 0), 1);
      scrollProgress.set(progress);
      setStoryProgress(progress);

      setFocusMode(
        (progress >= 0.08 && progress < 0.38) ||
          (progress >= 0.48 && progress < 0.68) ||
          (progress >= 0.7 && progress < 0.94)
      );

      const nextStage = progress < 0.38 ? 0 : progress < 0.68 ? 1 : progress < 0.94 ? 2 : 3;
      setStage((current) => (current === nextStage ? current : nextStage));
    }

    function onScroll() {
      if (frame) return;
      frame = window.requestAnimationFrame(updateFromScroll);
    }

    updateFromScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateFromScroll);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateFromScroll);
    };
  }, []);

  if (isLoading) {
    return (
      <section aria-busy="true" className="p-8">
        <p className="text-text-secondary">Loading cluster data...</p>
      </section>
    );
  }
  if (isError) {
    return (
      <section role="alert" className="p-8">
        <p className="text-accent-error">{(error as Error).message}</p>
      </section>
    );
  }
  if (!data || !heroPath) return null;

  const clusterPodsMap = getClusterPodsMap(data);
  const clusterItems = getClusterItems(data);
  const namespaceItems = getNamespaceItems(heroPath.cluster);
  const podItems = getPodItems(heroPath.namespace);
  const resourceItems = getResourceItems(heroPath.pod);

  const stageConfig = [
    {
      title: "Cluster Cost Overview",
      items: clusterItems,
      activeItemId: heroPath.cluster.id,
      pods: [],
      groupBy: "namespaceId" as const,
      podsById: clusterPodsMap,
      table: true,
    },
    {
      title: `${heroPath.cluster.name} / Namespaces`,
      items: namespaceItems,
      activeItemId: heroPath.namespace.id,
      pods: heroPath.cluster.namespaces.flatMap((n) => n.pods),
      groupBy: "namespaceId" as const,
      table: true,
    },
    {
      title: `${heroPath.namespace.name} / Pods`,
      items: podItems,
      activeItemId: heroPath.pod.id,
      pods: heroPath.namespace.pods,
      groupBy: "podId" as const,
      table: true,
    },
    {
      title: `${heroPath.pod.name} / Resources`,
      items: resourceItems,
      activeItemId: null,
      pods: [],
      groupBy: "podId" as const,
      table: false,
    },
  ];
  const current = stageConfig[stage];
  const gammaSplitProgress = Math.max(0, Math.min((storyProgress - 0.12) / 0.24, 1));
  const productionSplitProgress = Math.max(0, Math.min((storyProgress - 0.49) / 0.17, 1));
  const resourceSplitProgress = Math.max(0, Math.min((storyProgress - 0.7) / 0.22, 1));
  const showApiUnfold = stage === 2 && resourceSplitProgress > 0.01;
  const chartFade = showApiUnfold ? Math.max(0, 1 - resourceSplitProgress / 0.28) : 1;
  const showDashboardChart = stage < 3 || stage === 3;

  function jumpToChapter(index: number) {
    if (!trackRef.current) return;
    const trackTop = trackRef.current.offsetTop;
    const trackHeight = trackRef.current.offsetHeight;
    const scrollableDistance = trackHeight - window.innerHeight;
    const target = trackTop + (index / (CHAPTER_COUNT - 1)) * scrollableDistance;
    window.scrollTo({ top: target, behavior: "smooth" });
  }

  return (
    <section
      ref={trackRef}
      aria-label="Cloud cost dashboard scroll story"
      style={{ height: `${CHAPTER_COUNT * VH_PER_CHAPTER}vh` }}
      className="relative"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 flex items-center justify-center px-4 py-8 sm:px-8"
        >
          <div className="w-full max-w-4xl">
            <div className="mb-4 flex items-center justify-between rounded-full border border-gray-200/70 bg-white/80 px-4 py-2 shadow-sm backdrop-blur">
              <p className="text-sm font-medium text-text-primary">Cloud Cost Explorer</p>
              <p className="text-xs text-text-secondary">Cluster / Namespace / Pod / Resource</p>
            </div>

            {showDashboardChart && (
              <Card className="p-5 sm:p-6 mb-4 overflow-hidden">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <AnimatePresence mode="popLayout">
                    <motion.h2
                      key={current.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      className="text-text-primary text-lg font-semibold"
                    >
                      {current.title}
                    </motion.h2>
                  </AnimatePresence>
                  <span className="rounded-full bg-bg-surface-hover px-3 py-1 text-xs font-medium text-text-secondary">
                    Stage {stage + 1} / {CHAPTER_COUNT}
                  </span>
                </div>
                <div className="relative min-h-72 rounded-xl bg-[linear-gradient(to_right,rgba(3,3,3,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(3,3,3,0.06)_1px,transparent_1px)] bg-[size:25%_25%] py-5">
                  <motion.div
                    animate={{ opacity: chartFade, scale: showApiUnfold ? 0.96 : 1 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="inset-x-0"
                  >
                  {stage < 3 ? (
                    <LevelBars
                      items={current.items}
                      activeItemId={current.activeItemId}
                      onSelectItem={() => {}}
                      interactive={false}
                      focusMode={focusMode}
                      splitItems={
                        stage === 0
                          ? namespaceItems
                          : stage === 1
                          ? podItems
                          : undefined
                      }
                      splitProgress={
                        stage === 0
                          ? gammaSplitProgress
                          : stage === 1
                          ? productionSplitProgress
                          : 0
                      }
                      splitMode={stage === 1 ? "fan" : "stack"}
                      animateEntrance={stage === 0 && storyProgress < 0.08}
                    />
                  ) : (
                    <ApiResourceUnfold items={resourceItems} progress={1} />
                  )}
                  </motion.div>
                  {showApiUnfold && stage < 3 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: chartFade < 0.3 ? 1 - chartFade / 0.3 : 0 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <ApiResourceUnfold items={resourceItems} progress={resourceSplitProgress} />
                    </motion.div>
                  )}
                </div>
              </Card>
            )}

            <div className={`relative ${showApiUnfold || !current.table ? "min-h-[360px]" : ""}`}>
            <AnimatePresence mode="popLayout">
              {current.table && stage < 3 && (
                <motion.div
                  key={`table-${stage}`}
                  className={showApiUnfold ? "absolute inset-x-0 top-0 pointer-events-none" : ""}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{
                    opacity: showApiUnfold ? Math.max(0, 1 - resourceSplitProgress / 0.22) : 1,
                    y: showApiUnfold ? -12 * resourceSplitProgress : 0,
                    height: showApiUnfold ? Math.max(0, 1 - resourceSplitProgress / 0.35) * 260 : "auto",
                  }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Card className="p-5 sm:p-6 overflow-x-auto">
                    <LevelMetricTable
                      items={current.items}
                      pods={current.pods}
                      groupBy={current.groupBy}
                    podsById={current.podsById}
                  />
                </Card>
              </motion.div>
              )}
            </AnimatePresence>
            </div>
          </div>
        </motion.div>

        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {Array.from({ length: CHAPTER_COUNT }).map((_, i) => (
            <ChapterDot key={i} index={i} chapterFloat={chapterFloat} onClick={() => jumpToChapter(i)} />
          ))}
        </div>
      </div>
    </section>
  );
}
