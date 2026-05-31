"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function OfflineActions() {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
      <Button asChild>
        <Link href="/">Try again</Link>
      </Button>
      <Button
        variant="outline"
        type="button"
        onClick={() => window.location.reload()}
      >
        Reload
      </Button>
    </div>
  );
}
