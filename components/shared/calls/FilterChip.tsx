import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FilterChipProps {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}

export function FilterChip({ active, label, count, onClick }: FilterChipProps) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "default" : "outline"}
      onClick={onClick}
      aria-pressed={active}
      className="gap-1.5"
    >
      {label}
      <span
        className={cn(
          "rounded-chip px-1.5 py-0.5 text-[10px]",
          active ? "bg-white/20 text-white" : "bg-surface-secondary text-text-muted",
        )}
      >
        {count}
      </span>
    </Button>
  );
}
