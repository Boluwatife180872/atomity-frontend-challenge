import type { DashboardData } from "@/types/dashboard";
import type { HeroPath } from "@/hooks/useHeroPath";
import { LevelBars } from "./LevelBars";
import { LevelMetricTable } from "./LevelMetricTable";
import { Card } from "@/components/ui/Card";
import {
  getClusterItems,
  getNamespaceItems,
  getPodItems,
  getResourceItems,
  getClusterPodsMap,
} from "@/lib/drill";

export function StaticStackedFallback({
  data,
  heroPath,
}: {
  data: DashboardData;
  heroPath: HeroPath;
}) {
  const clusterPodsMap = getClusterPodsMap(data);

  return (
    <div className="p-8 space-y-12 max-w-4xl mx-auto">
      <section>
        <h2 className="text-text-primary text-lg font-semibold mb-4">Cluster Cost Overview</h2>
        <Card className="p-6 mb-4">
          <LevelBars items={getClusterItems(data)} activeItemId={heroPath.cluster.id} onSelectItem={() => {}} />
        </Card>
        <Card className="p-6 overflow-x-auto">
          <LevelMetricTable items={getClusterItems(data)} pods={[]} groupBy="namespaceId" podsById={clusterPodsMap} />
        </Card>
      </section>

      <section>
        <h2 className="text-text-primary text-lg font-semibold mb-4">{heroPath.cluster.name} — Namespaces</h2>
        <Card className="p-6 mb-4">
          <LevelBars items={getNamespaceItems(heroPath.cluster)} activeItemId={heroPath.namespace.id} onSelectItem={() => {}} />
        </Card>
        <Card className="p-6 overflow-x-auto">
          <LevelMetricTable
            items={getNamespaceItems(heroPath.cluster)}
            pods={heroPath.cluster.namespaces.flatMap((n) => n.pods)}
            groupBy="namespaceId"
          />
        </Card>
      </section>

      <section>
        <h2 className="text-text-primary text-lg font-semibold mb-4">{heroPath.namespace.name} — Pods</h2>
        <Card className="p-6 mb-4">
          <LevelBars items={getPodItems(heroPath.namespace)} activeItemId={heroPath.pod.id} onSelectItem={() => {}} />
        </Card>
        <Card className="p-6 overflow-x-auto">
          <LevelMetricTable items={getPodItems(heroPath.namespace)} pods={heroPath.namespace.pods} groupBy="podId" />
        </Card>
      </section>

      <section>
        <h2 className="text-text-primary text-lg font-semibold mb-4">{heroPath.pod.name} — Resource Breakdown</h2>
        <Card className="p-6">
          <LevelBars items={getResourceItems(heroPath.pod)} activeItemId={null} onSelectItem={() => {}} />
        </Card>
      </section>
    </div>
  );
}