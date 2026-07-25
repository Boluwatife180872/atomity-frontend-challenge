interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-bg-surface rounded-3xl shadow-sm ${className}`}
      style={{ border: "1px solid var(--card-border)" }}
    >
      {children}
    </div>
  );
}
