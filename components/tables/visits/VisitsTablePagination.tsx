import { Button } from "@/components/ui/button";

interface VisitsTablePaginationProps {
  showingLabel: string;
  pageLabel: string;
  previousLabel: string;
  nextLabel: string;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function VisitsTablePagination({
  showingLabel,
  pageLabel,
  previousLabel,
  nextLabel,
  page,
  totalPages,
  onPageChange,
}: VisitsTablePaginationProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-text-muted">{showingLabel}</p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          {previousLabel}
        </Button>
        <span className="text-sm text-text-secondary">{pageLabel}</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          {nextLabel}
        </Button>
      </div>
    </div>
  );
}
