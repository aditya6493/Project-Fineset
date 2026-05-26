import { cn } from "@/lib/utils";

interface PageTitleProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function PageTitle({ title, subtitle, className }: PageTitleProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <h1 className="font-display text-2xl font-bold text-text-primary">{title}</h1>
      {subtitle && <p className="text-text-secondary">{subtitle}</p>}
    </div>
  );
}

interface SectionTitleProps {
  title: string;
  className?: string;
}

export function SectionTitle({ title, className }: SectionTitleProps) {
  return (
    <h2
      className={cn(
        "font-display text-lg font-semibold text-text-primary",
        className,
      )}
    >
      {title}
    </h2>
  );
}
