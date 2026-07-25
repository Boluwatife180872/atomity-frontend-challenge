"use client";

import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/format";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { DrillItem } from "@/lib/drill";

interface LevelBarsProps {
  items: DrillItem[];
  activeItemId: string | null;
  onSelectItem: (id: string) => void;
  interactive?: boolean;
  focusMode?: boolean;
  splitItems?: DrillItem[];
  splitProgress?: number;
  splitMode?: "stack" | "fan" | "tiles";
  animateEntrance?: boolean;
  settleInstantly?: boolean;
}

export function LevelBars({
  items,
  activeItemId,
  onSelectItem,
  interactive = true,
  focusMode = false,
  splitItems,
  splitProgress = 0,
  splitMode = "stack",
  animateEntrance = true,
  settleInstantly = false,
}: LevelBarsProps) {
  const maxTotal = Math.max(...items.map((i) => i.total));
  const prefersReducedMotion = usePrefersReducedMotion();
  const activeIndex = items.findIndex((item) => item.id === activeItemId);
  const activeItem = activeIndex >= 0 ? items[activeIndex] : null;
  const hasSplit = Boolean(activeItem && splitItems?.length && splitProgress > 0.02);
  const splitMaxTotal = Math.max(...(splitItems ?? []).map((item) => item.total), 1);
  const sourceCenter = activeIndex >= 0 ? ((activeIndex + 0.5) / items.length) * 100 : 50;
  const travelProgress = Math.max(0, Math.min((splitProgress - 0.28) / 0.72, 1));
  const crackProgress = Math.max(0, Math.min(splitProgress / 0.28, 1));
  const fanProgress = Math.max(0, Math.min((splitProgress - 0.18) / 0.82, 1));
  const tileProgress = Math.max(0, Math.min((splitProgress - 0.2) / 0.8, 1));

  return (
    <motion.div layout className="relative h-44 px-4">
      <motion.div layout className="flex items-end justify-between gap-4 h-full">
      {items.map((item, index) => {
        const heightPercent = (item.total / maxTotal) * 100;
        const isActive = item.id === activeItemId;
        const Tag = interactive ? motion.button : motion.div;
        const isMuted = focusMode && activeItemId !== null && !isActive;
        const activeSplitting = hasSplit && isActive;
        const splitBaseOpacity = Math.max(0, 1 - splitProgress * 1.35);

        return (
          <Tag
            key={item.id}
            layout
            layoutId={`bar-shell-${index}`}
            {...(interactive
              ? { onClick: () => onSelectItem(item.id), "aria-pressed": isActive }
              : { role: "img", "aria-label": `${item.name}, ${formatCurrency(item.total)}` })}
            className="flex flex-col items-center flex-1 h-full group"
            initial={prefersReducedMotion || !animateEntrance ? false : { opacity: 0, y: 24 }}
            animate={{
              opacity: hasSplit
                ? activeSplitting
                  ? Math.max(0, 1 - splitProgress)
                  : splitBaseOpacity * (isMuted ? 0.34 : 1)
                : isMuted
                ? 0.34
                : 1,
              y: 0,
            }}
            whileInView={{
              opacity: hasSplit
                ? activeSplitting
                  ? Math.max(0, 1 - splitProgress)
                  : splitBaseOpacity * (isMuted ? 0.34 : 1)
                : isMuted
                ? 0.34
                : 1,
              y: 0,
            }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{
              layout: { duration: settleInstantly ? 0 : 0.9, ease: [0.16, 1, 0.3, 1] },
              duration: settleInstantly ? 0 : 0.7,
              delay: prefersReducedMotion ? 0 : index * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
            whileHover={interactive && !prefersReducedMotion ? { scale: 1.03 } : {}}
          >
            <div className="flex-1 w-full flex flex-col justify-end relative">
              <motion.div
                layoutId={`bar-fill-${index}`}
                className="w-full rounded-t-md bg-accent-primary relative"
                initial={prefersReducedMotion || !animateEntrance ? false : { height: 0 }}
                animate={{
                  height: `${heightPercent}%`,
                }}
                transition={{
                  duration: settleInstantly ? 0 : 0.9,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <span className="absolute -top-[18px] left-1/2 -translate-x-1/2 text-text-secondary text-xs whitespace-nowrap leading-none">
                  {formatCurrency(item.total)}
                </span>
              </motion.div>
            </div>
            <span className="text-text-primary text-sm font-medium mt-0.5">{item.name}</span>
          </Tag>
        );
      })}
      </motion.div>

      {hasSplit && activeItem && splitItems && (
        <div className="pointer-events-none absolute inset-x-4 bottom-7 top-5">
          {splitItems.map((item, index) => {
            const sourceHeight = (activeItem.total / maxTotal) * 100;
            const segmentHeight = (item.total / activeItem.total) * sourceHeight;
            const stackedBottom = splitItems
              .slice(0, index)
              .reduce((sum, previous) => sum + (previous.total / activeItem.total) * sourceHeight, 0);
            const targetCenter = ((index + 0.5) / splitItems.length) * 100;
            const progress = splitMode === "fan" ? fanProgress : splitMode === "tiles" ? tileProgress : travelProgress;
            const left = sourceCenter + (targetCenter - sourceCenter) * progress;
            const height = segmentHeight + ((item.total / splitMaxTotal) * 100 - segmentHeight) * travelProgress;
            const bottom = (stackedBottom + index * 3 * crackProgress) * (1 - travelProgress);
            const labelOpacity = Math.max(0, Math.min((progress - 0.35) / 0.45, 1));
            const fanLift = splitMode === "fan" ? Math.sin(fanProgress * Math.PI) * (24 + index * 8) : 0;
            const fanRotate = splitMode === "fan" ? (index - (splitItems.length - 1) / 2) * (1 - fanProgress) * 10 : 0;
            const tileWidth = 16 + tileProgress * 3;
            const tileBottom = splitMode === "tiles" ? 8 + (index % 2) * 8 * tileProgress : bottom;
            const tileHeight = splitMode === "tiles" ? 34 + (item.total / splitMaxTotal) * 48 * tileProgress : height;

            return (
              <motion.div
                key={item.id}
                className="absolute bottom-0 flex h-full flex-col justify-end"
                initial={false}
                animate={{
                  left: `${left}%`,
                  bottom: `${tileBottom}%`,
                  x: "-50%",
                  y: -fanLift,
                  rotate: fanRotate,
                  width:
                    splitMode === "tiles"
                      ? `${tileWidth}%`
                      : "18%",
                  opacity: Math.min(1, splitProgress * 1.3),
                  scaleY: 1 + crackProgress * 0.015,
                }}
                transition={{ duration: splitMode === "fan" ? 0.65 : 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.div
                  className={`relative w-full bg-accent-primary shadow-[0_8px_28px_rgba(80,210,141,0.28)] ${
                    splitMode === "tiles" ? "rounded-md" : "rounded-t-md"
                  }`}
                  animate={{
                    height: `${tileHeight}%`,
                    filter: `brightness(${1.04 + index * 0.035})`,
                  }}
                  transition={{ duration: splitMode === "fan" ? 0.65 : 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  <motion.span
                    animate={{ opacity: splitMode === "tiles" ? 0 : crackProgress * (1 - progress) }}
                    className="absolute left-1/2 top-0 h-px w-[116%] -translate-x-1/2 bg-white/75"
                  />
                  {splitMode === "tiles" && (
                    <motion.div
                      animate={{ opacity: tileProgress }}
                      className="absolute inset-0 rounded-md border border-white/35 bg-white/10"
                    />
                  )}
                </motion.div>
                <motion.div
                  animate={{ opacity: labelOpacity, y: labelOpacity ? 0 : -6 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-2 text-center"
                >
                  <p className="text-[11px] font-medium text-text-primary">{item.name}</p>
                  <p className="text-[10px] text-text-secondary">{formatCurrency(item.total)}</p>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
