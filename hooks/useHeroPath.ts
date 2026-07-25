"use client";

import { useMemo } from "react";
import type { DashboardData, Cluster, Namespace, Pod } from "@/types/dashboard";

export interface HeroPath {
  cluster: Cluster;
  namespace: Namespace;
  pod: Pod;
}

export function useHeroPath(data: DashboardData | undefined): HeroPath | null {
  return useMemo(() => {
    if (!data || data.clusters.length === 0) return null;

    const cluster =
      data.clusters.find((candidate) => candidate.name === "Cluster Gamma") ??
      data.clusters.reduce((a, b) => (b.total > a.total ? b : a));
    const namespace =
      cluster.namespaces.find((candidate) => candidate.name === "Production") ??
      cluster.namespaces.reduce((a, b) => (b.total > a.total ? b : a));
    const pod =
      namespace.pods.find((candidate) => candidate.name === "api-01") ??
      namespace.pods.reduce((a, b) => (b.total > a.total ? b : a));

    return { cluster, namespace, pod };
  }, [data]);
}
