import type { StoreCategory } from "@/types";

export const STORE_CATEGORY_LABELS: Record<StoreCategory, string> = {
  JEWELRY: "Jewelry",
  HANDBAGS: "Handbags",
  WATCHES: "Watches",
  OTHER: "Other",
};

export function getStoreCategoryLabel(category: StoreCategory): string {
  return STORE_CATEGORY_LABELS[category] ?? category;
}
