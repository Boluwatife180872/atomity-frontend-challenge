"use client";

import { useEffect, useRef } from "react";
import { animate, useInView } from "framer-motion";
import { formatCurrency } from "@/lib/format";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface CountUpProps {
  value: number;
  formatter?: (value: number) => string;
}

export function CountUp({ value, formatter = formatCurrency }: CountUpProps) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const latestValueRef = useRef(0);
  const isInView = useInView(nodeRef, { once: true, amount: 0.6 });
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    if (!isInView) return;

    if (prefersReducedMotion) {
      node.textContent = formatter(value);
      latestValueRef.current = value;
      return;
    }

    const controls = animate(latestValueRef.current, value, {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(latest) {
        node.textContent = formatter(Math.round(latest));
        latestValueRef.current = latest;
      },
    });

    return () => controls.stop();
  }, [isInView, value, prefersReducedMotion, formatter]);

  return <span ref={nodeRef}>{prefersReducedMotion ? formatter(value) : formatter(0)}</span>;
}
