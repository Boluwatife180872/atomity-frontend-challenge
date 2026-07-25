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

const RESOURCE_ICONS: Record<string, string> = {
  cpu: "CPU",
  ram: "RAM",
  storage: "SSD",
  network: "NET",
  gpu: "GPU",
};

function ApiResourceUnfold({ items, progress }: { items: DrillItem[]; progress: number }) {
  const revealProgress = Math.max(0, Math.min(progress / 0.58, 1));
  const splitProgress = Math.max(0, Math.min((progress - 0.5) / 0.5, 1));
  const maxTotal = Math.max(...items.map((item) => item.total), 1);

  return (
    <motion.div
      className="absolute inset-0"
      initial={false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative h-full overflow-hidden rounded-xl">
        <motion.div
          className="absolute top-[22%] origin-left rounded-lg bg-accent-primary sm:top-[15%]"
          style={{ boxShadow: "var(--shadow-accent-bar)" }}
          animate={{
            left: `${10.5 - revealProgress * 0.5}%`,
            width: `${18 + revealProgress * 72}%`,
            height: `${62 - revealProgress * 18}%`,
            opacity: 1 - splitProgress,
          }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />

        <div className="absolute inset-x-[4%] top-[22%] flex gap-[2px] sm:inset-x-[6%] sm:top-[15%] sm:gap-1 md:inset-x-[10%] md:gap-3">
          {items.map((item, index) => {
            const height = 74 + (item.total / maxTotal) * 52;
            const offset = (index - (items.length - 1) / 2) * 10;

            return (
              <motion.div
                key={item.id}
                className="relative flex-1"
                initial={false}
                animate={{
                  opacity: splitProgress,
                  y: (1 - splitProgress) * offset,
                  scaleX: 0.84 + splitProgress * 0.16,
                }}
                transition={{ duration: 0.9, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.div
                  className="relative mx-auto flex w-full flex-col justify-end overflow-hidden rounded-lg border border-white/35 bg-accent-primary"
                  style={{ boxShadow: "var(--shadow-accent-column)" }}
                  animate={{ height }}
                  transition={{ duration: 1, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="absolute inset-0 bg-white/10" />
                  <motion.div
                    className="absolute left-1/2 top-2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-md border border-white/35 bg-white/15 text-[7px] font-semibold text-white shadow-sm sm:top-4 sm:h-9 sm:w-9 sm:text-[10px]"
                    animate={{
                      opacity: Math.max(0, (splitProgress - 0.12) / 0.88),
                      scale: 0.88 + splitProgress * 0.12,
                    }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {RESOURCE_ICONS[item.id] ?? item.name.slice(0, 3).toUpperCase()}
                  </motion.div>
                </motion.div>
                <motion.div
                  className="mt-1 text-center sm:mt-3"
                  animate={{ opacity: Math.max(0, (splitProgress - 0.25) / 0.75), y: splitProgress ? 0 : -6 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <p className="text-[10px] font-semibold text-text-primary sm:text-sm">{item.name}</p>
                  <p className="text-[9px] text-text-secondary sm:text-xs">{formatCurrency(item.total)}</p>
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
          (progress >= 0.48 && progress < 0.72) ||
          (progress >= 0.82 && progress < 0.96)
      );

      const nextStage = progress < 0.43 ? 0 : progress < 0.72 ? 1 : progress < 0.84 ? 2 : 3;
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
  }, [scrollProgress]);

  if (isLoading) {
    return (
      <section aria-busy="true" className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="w-full max-w-md">
          <Card className="p-8 text-center flex flex-col items-center justify-center space-y-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-accent-primary/20 animate-pulse" />
              <div className="absolute inset-0 rounded-full border-4 border-accent-primary border-t-transparent animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-text-primary">Loading Cloud Telemetry</h3>
              <p className="text-xs text-text-secondary">Analyzing cluster nodes, namespaces, and pods...</p>
            </div>
          </Card>
        </div>
      </section>
    );
  }
  if (isError) {
    return (
      <section role="alert" className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="w-full max-w-md">
          <Card className="p-8 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-accent-error">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-text-primary">Failed to Load Dashboard</h3>
              <p className="text-xs text-accent-error">{(error as Error).message || "An unexpected error occurred while fetching telemetry data."}</p>
            </div>
          </Card>
        </div>
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
  const productionSplitProgress = Math.max(0, Math.min((storyProgress - 0.5) / 0.2, 1));
  const resourceSplitProgress = Math.max(0, Math.min((storyProgress - 0.84) / 0.16, 1));
  const showApiUnfold = stage === 3;
  const chartFade = showApiUnfold ? Math.max(0, 1 - resourceSplitProgress / 0.28) : 1;
  const showDashboardChart = stage < 3;
  const isGammaHandoff = stage === 1 && storyProgress < 0.48;
  const isProductionHandoff = stage === 2 && storyProgress < 0.78;

  function jumpToChapter(index: number) {
    if (!trackRef.current) return;
    const absoluteTop = trackRef.current.offsetTop;
    const trackHeight = trackRef.current.offsetHeight;
    const scrollableDistance = Math.max(trackHeight - window.innerHeight, 1);
    const targetProgresses = [0.10, 0.52, 0.78, 1.0];
    const progress = targetProgresses[index] ?? (index / (CHAPTER_COUNT - 1));
    const target = absoluteTop + progress * scrollableDistance;
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
          initial={{ opacity: 0, scale: 0.95, y: 32 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 flex items-center justify-center px-4 py-12 sm:px-8 sm:py-16"
        >
          <div className="w-full max-w-3xl">
            <div
              className="mb-3 flex flex-col items-center justify-between gap-1 rounded-full px-3 py-2 shadow-sm backdrop-blur sm:flex-row sm:px-4"
              style={{ backgroundColor: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}
            >
              <p className="text-xs font-medium text-text-primary sm:text-sm">Cloud Cost Explorer</p>
              <p className="text-[10px] text-text-secondary sm:text-xs">Cluster / Namespace / Pod / Resource</p>
            </div>

            {showDashboardChart && (
              <Card className="p-4 sm:p-5 mb-3 overflow-hidden">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <AnimatePresence mode="popLayout">
                    <motion.h2
                      key={current.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      className="text-sm font-semibold text-text-primary sm:text-lg"
                    >
                      {current.title}
                    </motion.h2>
                  </AnimatePresence>
                    <span
                      className="flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium"
                      style={{ backgroundColor: "var(--badge-stage-bg)", color: "var(--badge-stage-text)" }}
                    >
                    Stage {stage + 1} / {CHAPTER_COUNT}
                  </span>
                </div>
                <div
                  className="relative min-h-48 rounded-xl bg-[length:25%_25%] py-4 sm:min-h-64"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, var(--grid-color) 1px, transparent 1px), linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px)",
                  }}
                >
                  <motion.div
                    animate={{ opacity: chartFade, scale: showApiUnfold ? 0.96 : 1 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="inset-x-0"
                  >
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
                    settleInstantly={isGammaHandoff || isProductionHandoff}
                  />
                  </motion.div>
                </div>
              </Card>
            )}

            <div className={`relative ${showApiUnfold || !current.table ? "min-h-[360px]" : ""}`}>
            <AnimatePresence mode="popLayout">
              {current.table && stage < 3 && (
                <motion.div
                  key={`table-${stage}`}
                  className={showApiUnfold ? "absolute inset-x-0 top-0 pointer-events-none" : ""}
                  initial={isGammaHandoff || isProductionHandoff ? false : { opacity: 0, y: 18 }}
                  animate={{
                    opacity: showApiUnfold ? Math.max(0, 1 - resourceSplitProgress / 0.22) : 1,
                    y: showApiUnfold ? -12 * resourceSplitProgress : 0,
                    height: showApiUnfold ? Math.max(0, 1 - resourceSplitProgress / 0.35) * 260 : "auto",
                  }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Card className="p-4 sm:p-5 overflow-x-auto">
                    <LevelMetricTable
                      items={current.items}
                      pods={current.pods}
                      groupBy={current.groupBy}
                    podsById={current.podsById}
                  />
                </Card>
              </motion.div>
              )}
              {!current.table && (
                <div className="relative min-h-[280px] sm:min-h-[360px]">
                  <div className="mb-3 flex flex-col items-start gap-1 sm:mb-4 sm:flex-row sm:items-center sm:gap-4">
                    <motion.h2
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      className="text-base font-semibold text-text-primary sm:text-lg"
                    >
                      Resources from {heroPath.pod.name}
                    </motion.h2>
                  <span
                className="flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium"
                style={{ backgroundColor: "var(--badge-stage-bg)", color: "var(--badge-stage-text)" }}
              >
                      Stage {stage + 1} / {CHAPTER_COUNT}
                    </span>
                  </div>
                  <ApiResourceUnfold
                    key="api-resource-final"
                    items={resourceItems}
                    progress={resourceSplitProgress}
                  />
                </div>
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
