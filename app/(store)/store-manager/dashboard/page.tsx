import { content } from "@/content/en";
import { StoreManagerPortal } from "@/components/store/StoreManagerPortal";
import { requirePortalSession } from "@/lib/auth/require-portal-session";

export default async function StoreManagerDashboardPage() {
  const session = await requirePortalSession(["STORE_MANAGER"]);

  return (
    <StoreManagerPortal copy={content.store} storeId={session.storeId} />
  );
}
