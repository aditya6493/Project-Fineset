import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BUSINESS_OWNER_DASHBOARD_PATH } from "@/lib/auth/routes";

export default function BusinessOwnerNotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <h1 className="font-display text-2xl font-bold text-text-primary">Page not found</h1>
      <p className="text-text-secondary">This business owner dashboard page could not be found.</p>
      <Button asChild variant="outline">
        <Link href={BUSINESS_OWNER_DASHBOARD_PATH}>Back to overview</Link>
      </Button>
    </div>
  );
}
