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
          className="absolute top-[15%] origin-left rounded-lg bg-accent-primary shadow-[0_18px_60px_rgba(80,210,141,0.26)]"
          animate={{
            left: `${10.5 - revealProgress * 0.5}%`,
            width: `${18 + revealProgress * 72}%`,
            height: `${62 - revealProgress * 18}%`,
            opacity: 1 - splitProgress,
          }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />

        <div className="absolute inset-x-[10%] top-[15%] flex gap-3">
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
                  className="relative mx-auto flex w-full flex-col justify-end overflow-hidden rounded-lg border border-white/35 bg-accent-primary shadow-[0_14px_40px_rgba(80,210,141,0.2)]"
                  animate={{ height }}
                  transition={{ duration: 1, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="absolute inset-0 bg-white/10" />
                  <motion.div
                    className="absolute left-1/2 top-4 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-md border border-white/35 bg-white/15 text-[10px] font-semibold text-white shadow-sm"
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
                  className="mt-3 text-center"
                  animate={{ opacity: Math.max(0, (splitProgress - 0.25) / 0.75), y: splitProgress ? 0 : -6 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
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
  const productionSplitProgress = Math.max(0, Math.min((storyProgress - 0.5) / 0.2, 1));
  const resourceSplitProgress = Math.max(0, Math.min((storyProgress - 0.84) / 0.16, 1));
  const showApiUnfold = stage === 3;
  const chartFade = showApiUnfold ? Math.max(0, 1 - resourceSplitProgress / 0.28) : 1;
  const showDashboardChart = stage < 3;
  const isGammaHandoff = stage === 1 && storyProgress < 0.48;
  const isProductionHandoff = stage === 2 && storyProgress < 0.78;

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
          initial={{ opacity: 0, scale: 0.95, y: 32 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 flex items-center justify-center px-4 py-12 sm:px-8 sm:py-16"
        >
          <div className="w-full max-w-3xl">
            <div className="mb-3 flex items-center justify-between rounded-full border border-gray-200/70 bg-white/80 px-4 py-2 shadow-sm backdrop-blur">
              <p className="text-sm font-medium text-text-primary">Cloud Cost Explorer</p>
              <p className="text-xs text-text-secondary">Cluster / Namespace / Pod / Resource</p>
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
                      className="text-text-primary text-lg font-semibold"
                    >
                      {current.title}
                    </motion.h2>
                  </AnimatePresence>
                  <span className="rounded-full bg-bg-surface-hover px-3 py-1 text-xs font-medium text-text-secondary">
                    Stage {stage + 1} / {CHAPTER_COUNT}
                  </span>
                </div>
                <div className="relative min-h-64 rounded-xl bg-[linear-gradient(to_right,rgba(3,3,3,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(3,3,3,0.06)_1px,transparent_1px)] bg-[size:25%_25%] py-4">
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
                <div className="relative min-h-[360px]">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <motion.h2
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      className="text-text-primary text-lg font-semibold"
                    >
                      Resources from {heroPath.pod.name}
                    </motion.h2>
                    <span className="rounded-full bg-bg-surface-hover px-3 py-1 text-xs font-medium text-text-secondary">
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
