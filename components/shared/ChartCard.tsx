import { cn } from "@/lib/utils";

interface ChartCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function ChartCard({ title, children, className }: ChartCardProps) {
  return (
    <div
      className={cn(
        "rounded-card border border-border bg-surface-card p-4 shadow-card sm:p-6",
        className,
      )}
    >
      {title && (
        <h3 className="mb-4 font-display text-lg font-semibold text-text-primary">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
