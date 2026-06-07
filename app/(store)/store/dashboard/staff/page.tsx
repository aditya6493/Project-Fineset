import { redirect } from "next/navigation";
import { StoreStaffPageClient } from "@/components/store/StoreStaffPageClient";
import { getAppSession } from "@/lib/auth/get-app-session";
import { getRedirectForRole } from "@/lib/auth/routes";
import { fetchInitialStoreStaff } from "@/lib/data/staff";

interface StoreStaffPageProps {
  searchParams: Promise<{ storeId?: string }>;
}

export default async function StoreStaffPage({ searchParams }: StoreStaffPageProps) {
  const session = await getAppSession();
  if (!session) {
    redirect("/");
  }
  if (session.role !== "BUSINESS_OWNER") {
    redirect(getRedirectForRole(session.role));
  }

  const { storeId } = await searchParams;
  let initial: Awaited<ReturnType<typeof fetchInitialStoreStaff>> = null;
  try {
    initial = await fetchInitialStoreStaff(storeId);
  } catch (error) {
    console.error("[store-staff] initial staff failed", { storeId, error });
  }

  return (
    <StoreStaffPageClient
      urlStoreId={storeId}
      initialStaff={initial?.data}
    />
  );
}
