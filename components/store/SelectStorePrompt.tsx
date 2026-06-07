"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BUSINESS_OWNER_DASHBOARD_PATH } from "@/lib/auth/routes";
import type { Content } from "@/content/en";

type StoreContent = Content["store"];

export function SelectStorePrompt({ store }: { store: StoreContent }) {
  return (
    <div className="rounded-card border border-border bg-surface-card p-8 text-center shadow-card">
      <p className="text-text-secondary">{store.portfolio.selectStorePrompt}</p>
      <Button asChild className="mt-4" variant="outline">
        <Link href={BUSINESS_OWNER_DASHBOARD_PATH} prefetch={false}>
          {store.portfolio.backToStores}
        </Link>
      </Button>
    </div>
  );
}
