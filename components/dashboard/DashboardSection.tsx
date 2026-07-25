"use client";

import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDashboardData } from "@/hooks/useDashboardData";
import { LevelBars } from "./LevelBars";
import { LevelMetricTable } from "./LevelMetricTable";
import { Breadcrumb } from "./Breadcrumb";
import { Card } from "@/components/ui/Card";
import {
  getClusterItems,
  getClusterPodsMap,
  getNamespaceItems,
  getPodItems,
  getResourceItems,
  type DrillLevel,
} from "@/lib/drill";

export function DashboardSection() {
  const { data, isLoading, isError, error } = useDashboardData();

  const [level, setLevel] = useState<DrillLevel>("cluster");
  const [clusterId, setClusterId] = useState<string | null>(null);
  const [namespaceId, setNamespaceId] = useState<string | null>(null);
  const [podId, setPodId] = useState<string | null>(null);

  const cluster = useMemo(
    () => data?.clusters.find((c) => c.id === clusterId) ?? null,
    [data, clusterId]
  );
  const namespace = useMemo(
    () => cluster?.namespaces.find((n) => n.id === namespaceId) ?? null,
    [cluster, namespaceId]
  );
  const pod = useMemo(
    () => namespace?.pods.find((p) => p.id === podId) ?? null,
    [namespace, podId]
  );

  const clusterPodsMap = useMemo(() => data ? getClusterPodsMap(data) : {}, [data]);

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
  if (!data) return null;

  const items =
    level === "cluster"
      ? getClusterItems(data)
      : level === "namespace" && cluster
      ? getNamespaceItems(cluster)
      : level === "pod" && namespace
      ? getPodItems(namespace)
      : level === "resource" && pod
      ? getResourceItems(pod)
      : [];

  const activeId =
    level === "cluster" ? clusterId : level === "namespace" ? namespaceId : level === "pod" ? podId : null;

  function handleSelect(id: string) {
    if (level === "cluster") {
      setClusterId(id);
      setLevel("namespace");
    } else if (level === "namespace") {
      setNamespaceId(id);
      setLevel("pod");
    } else if (level === "pod") {
      setPodId(id);
      setLevel("resource");
    }
    // resource level is a leaf — no further drill
  }

  const breadcrumbPath = [
    { label: "Clusters", onClick: level !== "cluster" ? () => resetTo("cluster") : undefined },
    ...(cluster && level !== "cluster"
      ? [{ label: cluster.name, onClick: level !== "namespace" ? () => resetTo("namespace") : undefined }]
      : []),
    ...(namespace && (level === "pod" || level === "resource")
      ? [{ label: namespace.name, onClick: level !== "pod" ? () => resetTo("pod") : undefined }]
      : []),
    ...(pod && level === "resource" ? [{ label: pod.name }] : []),
  ];

  function resetTo(targetLevel: DrillLevel) {
    setLevel(targetLevel);
    if (targetLevel === "cluster") {
      setNamespaceId(null);
      setPodId(null);
    } else if (targetLevel === "namespace") {
      setPodId(null);
    }
  }

  return (
    <section aria-label="Cloud cost dashboard" className="p-8 space-y-6 max-w-4xl mx-auto">
      <Breadcrumb path={breadcrumbPath} />

      <AnimatePresence mode="wait">
        <motion.div
          key={level + (activeId ?? "")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Card className="p-6 mb-6">
            <h2 className="text-text-primary text-lg font-semibold mb-6">
              {level === "cluster" && "Cluster Cost Overview"}
              {level === "namespace" && `${cluster?.name} — Namespaces`}
              {level === "pod" && `${namespace?.name} — Pods`}
              {level === "resource" && `${pod?.name} — Resource Breakdown`}
            </h2>
            <LevelBars items={items} activeItemId={activeId} onSelectItem={handleSelect} />
          </Card>

          {level !== "resource" && (
            <Card className="p-6 overflow-x-auto">
              <LevelMetricTable
                items={items}
                pods={
                  level === "cluster"
                    ? []
                    : level === "namespace" && cluster
                    ? cluster.namespaces.flatMap((n) => n.pods)
                    : namespace?.pods ?? []
                }
                groupBy={level === "pod" ? "podId" : "namespaceId"}
                podsById={level === "cluster" ? clusterPodsMap : undefined}
              />
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
