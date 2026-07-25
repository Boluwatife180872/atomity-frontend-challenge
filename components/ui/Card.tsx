interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-white rounded-3xl border border-gray-200/60 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}