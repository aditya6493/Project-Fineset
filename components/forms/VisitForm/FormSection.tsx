import { cn } from "@/lib/utils";

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function FormSection({ title, children, className, id }: FormSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "rounded-card border border-border bg-surface-card p-4 shadow-card sm:p-6",
        className,
      )}
    >
      <h2 className="mb-4 font-display text-lg font-semibold text-text-primary">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

interface ProgressIndicatorProps {
  label: string;
  current: number;
  total: number;
}

export function ProgressIndicator({ label, current, total }: ProgressIndicatorProps) {
  const percent = Math.round((current / total) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-text-primary">{label}</span>
        <span className="text-text-muted">
          {current}/{total}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-chip bg-surface-secondary">
        <div
          className="progress-bar-fill h-full bg-brand-gold transition-all duration-300"
          style={{ ["--progress" as string]: `${percent}%` }}
        />
      </div>
    </div>
  );
}
