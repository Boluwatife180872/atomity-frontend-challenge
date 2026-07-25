"use client";

import { motion } from "framer-motion";
import { CountUp } from "@/components/ui/CountUp";
import type { Pod } from "@/types/dashboard";
import type { DrillItem } from "@/lib/drill";

interface LevelMetricTableProps {
  items: DrillItem[];
  pods: Pod[];
  groupBy: "namespaceId" | "podId";
  podsById?: Record<string, Pod[]>;
}

const COLUMNS = [
  { key: "cpu", label: "CPU" },
  { key: "ram", label: "RAM" },
  { key: "storage", label: "Storage" },
  { key: "network", label: "Network" },
  { key: "gpu", label: "GPU" },
] as const;

function averageEfficiency(pods: Pod[]) {
  if (pods.length === 0) return 0;
  return Math.round(pods.reduce((sum, pod) => sum + pod.efficiency, 0) / pods.length);
}

export function LevelMetricTable({ items, pods, groupBy, podsById }: LevelMetricTableProps) {
  return (
    <table className="w-full text-sm border-collapse">
      <caption className="sr-only">Cost breakdown by resource metric</caption>
      <thead>
        <tr className="text-text-secondary text-left border-b border-white/10">
          <th scope="col" className="py-2 pr-2 font-medium sm:py-3 sm:pr-4">Name</th>
          {COLUMNS.map((col) => (
            <th key={col.key} scope="col" className="py-2 px-2 font-medium sm:py-3 sm:px-3 md:px-4">{col.label}</th>
          ))}
          <th scope="col" className="py-2 px-2 font-medium sm:py-3 sm:px-3 md:px-4">Efficiency</th>
          <th scope="col" className="py-2 pl-2 font-medium text-right sm:py-3 sm:pl-4">Total</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => {
          const scopedPods = podsById
            ? (podsById[item.id] ?? [])
            : pods.filter((p) =>
                groupBy === "podId" ? p.id === item.id : p.namespaceId === item.id
              );

          const metricSums = COLUMNS.reduce((acc, col) => {
            acc[col.key] = scopedPods.reduce((sum, p) => sum + p[col.key], 0);
            return acc;
          }, {} as Record<(typeof COLUMNS)[number]["key"], number>);

          return (
            <motion.tr
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 + index * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="border-b border-white/5"
            >
              <th scope="row" className="py-2 pr-2 font-medium text-text-primary text-left sm:py-3 sm:pr-4">
                {item.name}
              </th>
              {COLUMNS.map((col) => (
                <td key={col.key} className="py-2 px-2 text-text-secondary sm:py-3 sm:px-3 md:px-4">
                  <CountUp value={metricSums[col.key]} />
                </td>
              ))}
              <td className="py-2 px-2 text-text-secondary sm:py-3 sm:px-3 md:px-4">
                <CountUp value={averageEfficiency(scopedPods)} formatter={(value) => `${value}%`} />
              </td>
              <td className="py-2 pl-2 text-right font-semibold text-text-primary sm:py-3 sm:pl-4">
                <CountUp value={item.total} />
              </td>
            </motion.tr>
          );
        })}
      </tbody>
    </table>
  );
}
