import { Input } from "@/components/ui/input";
import { ExportButton } from "@/components/shared/ExportButton";
import type { VisitsCopy } from "./types";

interface VisitsTableToolbarProps {
  copy: VisitsCopy;
  searchPlaceholder: string;
  search: string;
  onSearchChange: (value: string) => void;
  onExport: () => void;
  exportDisabled: boolean;
}

export function VisitsTableToolbar({
  copy,
  searchPlaceholder,
  search,
  onSearchChange,
  onExport,
  exportDisabled,
}: VisitsTableToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="font-display text-xl font-semibold text-text-primary">
        {copy.title}
      </h2>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          placeholder={searchPlaceholder}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="sm:w-64"
          aria-label={searchPlaceholder}
        />
        <ExportButton
          label={copy.exportCsv}
          onExport={onExport}
          disabled={exportDisabled}
        />
      </div>
    </div>
  );
}
