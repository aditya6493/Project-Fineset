import { content } from "@/content/en";

export default function StaffCallsLoading() {
  return (
    <div className="min-w-0 space-y-4 lg:space-y-5" aria-busy="true" aria-live="polite">
      <div className="space-y-3">
        <div className="h-5 w-28 animate-pulse rounded bg-surface-muted" />
        <div className="space-y-2">
          <div className="h-8 w-40 animate-pulse rounded bg-surface-muted" />
          <div className="h-4 w-64 animate-pulse rounded bg-surface-muted" />
        </div>
      </div>
      <div className="h-36 animate-pulse rounded-xl bg-surface-muted" />
      <p className="sr-only">{content.common.loading}</p>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-xl bg-surface-muted" />
        ))}
      </div>
    </div>
  );
}
