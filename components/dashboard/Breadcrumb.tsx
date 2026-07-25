"use client";

import { motion, AnimatePresence } from "framer-motion";

interface BreadcrumbProps {
  path: { label: string; onClick?: () => void }[];
}

export function Breadcrumb({ path }: BreadcrumbProps) {
  return (
    <nav aria-label="Drill-down breadcrumb" className="flex items-center gap-2 text-sm mb-4">
      <AnimatePresence mode="popLayout">
        {path.map((crumb, index) => (
          <motion.span
            key={crumb.label}
            layout
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-2"
          >
            {index > 0 && <span className="text-text-muted">/</span>}
            {crumb.onClick ? (
              <button
                onClick={crumb.onClick}
                className="text-text-secondary hover:text-accent-primary transition-colors"
              >
                {crumb.label}
              </button>
            ) : (
              <span className="text-text-primary font-medium">{crumb.label}</span>
            )}
          </motion.span>
        ))}
      </AnimatePresence>
    </nav>
  );
}