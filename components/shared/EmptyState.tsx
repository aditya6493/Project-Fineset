import { cn } from "@/lib/utils";

interface EmptyStateProps {
  message: string;
  className?: string;
}

export function EmptyState({ message, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-card border border-dashed border-border bg-surface-card px-6 py-12 text-center text-text-muted",
        className,
      )}
    >
      {message}
    </div>
  );
}
