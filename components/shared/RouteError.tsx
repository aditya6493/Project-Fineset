"use client";

import { AlertTriangle } from "lucide-react";
import { content } from "@/content/en";
import { Button } from "@/components/ui/button";

interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export function RouteError({ error, reset }: RouteErrorProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-status-error/10 text-status-error">
        <AlertTriangle className="h-7 w-7" aria-hidden="true" />
      </div>
      <h1 className="mt-6 font-display text-2xl font-bold text-text-primary">
        {content.errors.boundaryTitle}
      </h1>
      <p className="mt-2 max-w-md text-sm text-text-secondary">
        {content.errors.generic}
      </p>
      {process.env.NODE_ENV === "development" && error.message && (
        <p className="mt-4 max-w-lg rounded-input bg-surface-secondary px-4 py-2 font-mono text-xs text-text-muted">
          {error.message}
        </p>
      )}
      <Button type="button" className="mt-6" onClick={reset}>
        {content.errors.tryAgain}
      </Button>
    </div>
  );
}
