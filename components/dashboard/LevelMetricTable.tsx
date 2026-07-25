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
          <th scope="col" className="py-3 pr-4 font-medium">Name</th>
          {COLUMNS.map((col) => (
            <th key={col.key} scope="col" className="py-3 px-4 font-medium">{col.label}</th>
          ))}
          <th scope="col" className="py-3 px-4 font-medium">Efficiency</th>
          <th scope="col" className="py-3 pl-4 font-medium text-right">Total</th>
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
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="border-b border-white/5"
            >
              <th scope="row" className="py-3 pr-4 font-medium text-text-primary text-left">
                {item.name}
              </th>
              {COLUMNS.map((col) => (
                <td key={col.key} className="py-3 px-4 text-text-secondary">
                  <CountUp value={metricSums[col.key]} />
                </td>
              ))}
              <td className="py-3 px-4 text-text-secondary">
                <CountUp value={averageEfficiency(scopedPods)} formatter={(value) => `${value}%`} />
              </td>
              <td className="py-3 pl-4 text-right font-semibold text-text-primary">
                <CountUp value={item.total} />
              </td>
            </motion.tr>
          );
        })}
      </tbody>
    </table>
  );
}
