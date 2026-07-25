export interface ResourceMetrics {
  cpu: number;
  ram: number;
  storage: number;
  network: number;
  gpu: number;
}

export interface Pod extends ResourceMetrics {
  id: string;
  name: string;
  namespaceId: string;
  efficiency: number;
  total: number;
}

export interface Namespace {
  id: string;
  name: string;
  clusterId: string;
  pods: Pod[];
  total: number;
}

export interface Cluster {
  id: string;
  name: string;
  namespaces: Namespace[];
  total: number;
}

export interface DashboardData {
  clusters: Cluster[];
}