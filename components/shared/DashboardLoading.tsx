import { Skeleton } from "@/components/ui/skeleton";

interface DashboardLoadingProps {
  title?: boolean;
  kpiCount?: number;
}

export function DashboardLoading({
  title = true,
  kpiCount = 4,
}: DashboardLoadingProps) {
  return (
    <div className="space-y-6">
      {title && (
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: kpiCount }).map((_, index) => (
          <div
            key={index}
            className="rounded-card border border-border bg-surface-card p-4 shadow-card sm:p-5"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-8 w-20" />
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-32 rounded-card" />
          <Skeleton className="h-32 rounded-card" />
        </div>
      </div>
    </div>
  );
}
