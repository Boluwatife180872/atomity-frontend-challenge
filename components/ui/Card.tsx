interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-bg-surface rounded-3xl shadow-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-md ${className}`}
      style={{ border: "1px solid var(--card-border)" }}
    >
      {children}
    </div>
  );
}