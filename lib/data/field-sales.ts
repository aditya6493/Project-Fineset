import { cache } from "react";
import type { CreateFieldSaleInput } from "@/lib/validations/field-sale.schema";
import { getServerSession, requireRole } from "@/lib/auth/session";
import { resolveAccessibleStoreId } from "@/lib/services/manager-stores";
import { listFieldSales } from "@/lib/services/field-sales";
import { defaultFieldSalesParams } from "@/lib/query/initial-data";
import type { FieldSaleListResponse, GetFieldSalesListParams } from "@/types";

export interface InitialFieldSalesPayload {
  params: GetFieldSalesListParams;
  data: FieldSaleListResponse;
}

export const fetchInitialFieldSales = cache(async function fetchInitialFieldSales(
  storeId?: string,
  overrides?: GetFieldSalesListParams,
): Promise<InitialFieldSalesPayload | null> {
  const session = await getServerSession();
  if (!requireRole(session, ["STORE_MANAGER", "BUSINESS_OWNER", "MASTER_ADMIN"])) {
    return null;
  }

  let resolvedStoreId = storeId;
  if (session.role === "STORE_MANAGER" || session.role === "BUSINESS_OWNER") {
    resolvedStoreId = await resolveAccessibleStoreId(
      session,
      storeId ?? overrides?.storeId,
    );
  }

  const params: GetFieldSalesListParams = {
    ...defaultFieldSalesParams(resolvedStoreId),
    ...overrides,
    storeId: resolvedStoreId ?? overrides?.storeId,
  };
  const data = await listFieldSales({
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 15,
    year: params.year ?? new Date().getFullYear(),
    month: params.month ?? new Date().getMonth() + 1,
    storeId: params.storeId,
    staffId: params.staffId,
    search: params.search,
    enrollmentOutcome: params.enrollmentOutcome as
      | CreateFieldSaleInput["enrollmentOutcome"]
      | undefined,
    activityType: params.activityType as CreateFieldSaleInput["activityType"] | undefined,
  });

  return { params, data };
});
