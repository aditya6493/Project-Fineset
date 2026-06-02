import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { VisitsCopy } from "./types";

interface VisitsTableToolbarProps {
  copy: VisitsCopy;
  total: number;
  searchPlaceholder: string;
  search: string;
  onSearchChange: (value: string) => void;
  onImport: (file: File) => void;
  importDisabled: boolean;
  isImporting: boolean;
  importStatusMessage?: string;
  importStatusTone?: "default" | "success" | "error";
}

export function VisitsTableToolbar({
  copy,
  total,
  searchPlaceholder,
  search,
  onSearchChange,
  onImport,
  importDisabled,
  isImporting,
  importStatusMessage,
  importStatusTone = "default",
}: VisitsTableToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="font-display text-xl font-semibold text-text-primary">
        {copy.title}{" "}
        <span className="font-numeric text-base font-medium text-text-muted">
          ({total.toLocaleString("en-IN")})
        </span>
      </h2>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          placeholder={searchPlaceholder}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="sm:w-64"
          aria-label={searchPlaceholder}
        />
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onImport(file);
              event.currentTarget.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={importDisabled || isImporting}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            {isImporting ? copy.importingCsv : copy.importCsv}
          </Button>
      </div>
    </div>
      {importStatusMessage ? (
        <p
          className={
            importStatusTone === "success"
              ? "text-xs text-status-success"
              : importStatusTone === "error"
                ? "text-xs text-status-error"
                : "text-xs text-text-muted"
          }
        >
          {importStatusMessage}
        </p>
      ) : null}
    </div>
  );
}
