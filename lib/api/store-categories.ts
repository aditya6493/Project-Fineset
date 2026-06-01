import { apiFetch } from "@/lib/api/client";

export interface StoreCategoryOptionsResponse {
  data: string[];
}

export async function getStoreCategoryOptions(): Promise<StoreCategoryOptionsResponse> {
  return apiFetch<StoreCategoryOptionsResponse>("/api/store-categories");
}
