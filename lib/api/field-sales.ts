import { apiFetch, buildQueryString } from "@/lib/api/client";
import type { CreateFieldSaleInput } from "@/lib/validations/field-sale.schema";
import type { FieldSaleListResponse, GetFieldSalesListParams } from "@/types";
import type { FieldSale } from "@prisma/client";

export async function createFieldSale(
  payload: CreateFieldSaleInput,
): Promise<FieldSale> {
  return apiFetch<FieldSale>("/api/field-sales", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getFieldSalesList(
  params: GetFieldSalesListParams = {},
): Promise<FieldSaleListResponse> {
  const qs = buildQueryString(params);
  return apiFetch<FieldSaleListResponse>(`/api/field-sales${qs}`);
}
