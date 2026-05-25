"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportButtonProps {
  label: string;
  onExport: () => void;
  disabled?: boolean;
}

export function ExportButton({ label, onExport, disabled }: ExportButtonProps) {
  return (
    <Button type="button" variant="outline" size="sm" onClick={onExport} disabled={disabled}>
      <Download className="h-4 w-4" />
      {label}
    </Button>
  );
}

function escapeCsvValue(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function downloadCsv(filename: string, headers: string[], rows: string[][]): void {
  const lines = [
    headers.map(escapeCsvValue).join(","),
    ...rows.map((row) => row.map(escapeCsvValue).join(",")),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
