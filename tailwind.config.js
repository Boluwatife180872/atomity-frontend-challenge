/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-primary": "var(--color-bg-primary)",
        "bg-surface": "var(--color-bg-surface)",
        "bg-surface-hover": "var(--color-bg-surface-hover)",
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "text-muted": "var(--color-text-muted)",
        "accent-primary": "var(--color-accent-primary)",
        "accent-success": "var(--color-accent-success)",
        "accent-error": "var(--color-accent-error)",
        "accent-warning": "var(--color-accent-warning)",
        "metric-cpu": "var(--color-metric-cpu)",
        "metric-ram": "var(--color-metric-ram)",
        "metric-storage": "var(--color-metric-storage)",
        "metric-network": "var(--color-metric-network)",
        "metric-gpu": "var(--color-metric-gpu)",
      },
    },
  },
  plugins: [],
}
