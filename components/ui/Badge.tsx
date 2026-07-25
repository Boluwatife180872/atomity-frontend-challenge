interface BadgeProps {
  label: string;
  variant?: "default" | "success" | "error";
}

export function Badge({ label, variant = "default" }: BadgeProps) {
  const variantClasses = {
    default: "bg-bg-surface text-text-secondary",
    success: "bg-accent-success/15 text-accent-success",
    error: "bg-accent-error/15 text-accent-error",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${variantClasses[variant]}`}
    >
      {label}
    </span>
  );
}