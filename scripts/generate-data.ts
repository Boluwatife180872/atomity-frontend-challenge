import fs from "node:fs";
import path from "node:path";
import type { Pod, Namespace, Cluster, DashboardData } from "@/types/dashboard";

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const CLUSTERS = [
  { name: "Cluster Alpha", multiplier: 0.45 },
  { name: "Cluster Beta", multiplier: 0.65 },
  { name: "Cluster Gamma", multiplier: 2.0 },  // hero cluster — auto-focus of the scroll story
  { name: "Cluster Delta", multiplier: 0.85 },
];

const NAMESPACES = [
  { name: "Production", multiplier: 1.6 },     // hero namespace within its cluster
  { name: "Staging", multiplier: 0.7 },
  { name: "Monitoring", multiplier: 0.45 },
  { name: "Shared", multiplier: 1.0 },
];

const PODS = [
  { name: "api-01", multiplier: 1.5 },         // hero pod within its namespace
  { name: "worker-02", multiplier: 0.6 },
  { name: "billing-01", multiplier: 1.0 },
  { name: "gateway-01", multiplier: 0.4 },
];

function createPod(
  id: string,
  namespaceId: string,
  name: string,
  combinedMultiplier: number
): Pod {
  const cpu = Math.round(randomInt(250, 900) * combinedMultiplier);
  const ram = Math.round(randomInt(180, 700) * combinedMultiplier);
  const storage = Math.round(randomInt(120, 550) * combinedMultiplier);
  const network = Math.round(randomInt(80, 300) * combinedMultiplier);
  const gpu = Math.round(randomInt(0, 450) * combinedMultiplier);
  const total = cpu + ram + storage + network + gpu;

  return { id, name, namespaceId, cpu, ram, storage, network, gpu, efficiency: randomInt(82, 99), total };
}

function createNamespace(
  id: string,
  clusterId: string,
  nsProfile: { name: string; multiplier: number },
  clusterMultiplier: number
): Namespace {
  const pods: Pod[] = PODS.map((podProfile, index) => {
    const combined = clusterMultiplier * nsProfile.multiplier * podProfile.multiplier;
    return createPod(`${id}-pod-${index + 1}`, id, podProfile.name, combined);
  });

  const total = pods.reduce((sum, pod) => sum + pod.total, 0);
  return { id, name: nsProfile.name, clusterId, pods, total };
}

function createCluster(id: string, clusterProfile: { name: string; multiplier: number }): Cluster {
  const namespaces: Namespace[] = NAMESPACES.map((nsProfile, index) =>
    createNamespace(`${id}-ns-${index + 1}`, id, nsProfile, clusterProfile.multiplier)
  );

  const total = namespaces.reduce((sum, ns) => sum + ns.total, 0);
  return { id, name: clusterProfile.name, namespaces, total };
}

function generateDashboard(): DashboardData {
  const clusters: Cluster[] = CLUSTERS.map((profile, index) =>
    createCluster(`cluster-${index + 1}`, profile)
  );
  return { clusters };
}

const dashboard = generateDashboard();
const outputPath = path.join(process.cwd(), "data", "dashboard.json");
fs.writeFileSync(outputPath, JSON.stringify(dashboard, null, 2));

console.log(`✅ Dashboard data written to ${outputPath}`);
console.log(`Generated ${dashboard.clusters.length} clusters`);