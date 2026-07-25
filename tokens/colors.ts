export const colors = {
  bg: {
    primary: "var(--color-bg-primary)",
    surface: "var(--color-bg-surface)",
    surfaceHover: "var(--color-bg-surface-hover)",
  },
  text: {
    primary: "var(--color-text-primary)",
    secondary: "var(--color-text-secondary)",
    muted: "var(--color-text-muted)",
  },
  accent: {
    primary: "var(--color-accent-primary)",
    success: "var(--color-accent-success)",
    error: "var(--color-accent-error)",
    warning: "var(--color-accent-warning)",
  },
  metric: {
    cpu: "var(--color-metric-cpu)",
    ram: "var(--color-metric-ram)",
    storage: "var(--color-metric-storage)",
    network: "var(--color-metric-network)",
    gpu: "var(--color-metric-gpu)",
  },
} as const;