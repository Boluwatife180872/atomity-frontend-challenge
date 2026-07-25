import type { DashboardData, Cluster, Namespace, Pod } from "@/types/dashboard";

export type DrillLevel = "cluster" | "namespace" | "pod" | "resource";

export interface DrillItem {
  id: string;
  name: string;
  total: number;
}

function sumPods(pods: Pod[]) {
  return pods.reduce(
    (acc, p) => ({
      cpu: acc.cpu + p.cpu,
      ram: acc.ram + p.ram,
      storage: acc.storage + p.storage,
      network: acc.network + p.network,
      gpu: acc.gpu + p.gpu,
    }),
    { cpu: 0, ram: 0, storage: 0, network: 0, gpu: 0 }
  );
}

export function getClusterItems(data: DashboardData): DrillItem[] {
  return data.clusters.map((c) => ({ id: c.id, name: c.name, total: c.total }));
}

export function getNamespaceItems(cluster: Cluster): DrillItem[] {
  return cluster.namespaces.map((ns) => ({ id: ns.id, name: ns.name, total: ns.total }));
}

export function getPodItems(namespace: Namespace): DrillItem[] {
  return namespace.pods.map((pod) => ({ id: pod.id, name: pod.name, total: pod.total }));
}

export function getResourceItems(pod: Pod): DrillItem[] {
  return [
    { id: "cpu", name: "CPU", total: pod.cpu },
    { id: "ram", name: "RAM", total: pod.ram },
    { id: "storage", name: "Storage", total: pod.storage },
    { id: "network", name: "Network", total: pod.network },
    { id: "gpu", name: "GPU", total: pod.gpu },
  ];
}

export function getClusterPodsMap(data: DashboardData): Record<string, Pod[]> {
  const map: Record<string, Pod[]> = {};
  data.clusters.forEach((c) => {
    map[c.id] = c.namespaces.flatMap((ns) => ns.pods);
  });
  return map;
}

// full metric breakdown for the table, at cluster/namespace granularity
export function getMetricBreakdown(pods: Pod[]) {
  return sumPods(pods);
}