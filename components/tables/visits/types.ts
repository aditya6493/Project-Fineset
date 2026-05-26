import type { Content } from "@/content/en";
import type { VisitListItem } from "@/types";

export type VisitFormFields = Content["visitForm"]["fields"];
export type VisitsCopy = Content["store"]["visits"];

export interface VisitsTableProps {
  copy: VisitsCopy & { showing: string; page: string };
  emptyMessage: string;
  searchPlaceholder: string;
  previousLabel: string;
  nextLabel: string;
  yesLabel: string;
  noLabel: string;
  data: VisitListItem[];
  total: number;
  page: number;
  pageSize: number;
  search: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  fieldLabels: VisitFormFields;
  isLoading?: boolean;
}

export interface VisitColumnLabels {
  copy: VisitsTableProps["copy"];
  fieldLabels: VisitFormFields;
  productLabels: Record<string, string>;
  yesLabel: string;
  noLabel: string;
}
