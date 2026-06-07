import Link from "next/link";
import { Button } from "@/components/ui/button";
import { STORE_MANAGER_DASHBOARD_PATH } from "@/lib/auth/routes";

export default function StoreManagerNotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <h1 className="font-display text-2xl font-bold text-text-primary">Page not found</h1>
      <p className="text-text-secondary">This store manager page could not be found.</p>
      <Button asChild variant="outline">
        <Link href={STORE_MANAGER_DASHBOARD_PATH}>Back to overview</Link>
      </Button>
    </div>
  );
}
