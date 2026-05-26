import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface QueryLoadStateProps {
  isLoading?: boolean;
  isError?: boolean;
  loadingLabel?: string;
  errorLabel?: string;
  retryLabel?: string;
  onRetry?: () => void;
  skeletonCount?: number;
  children?: React.ReactNode;
}

export function QueryLoadState({
  isLoading = false,
  isError = false,
  loadingLabel,
  errorLabel,
  retryLabel,
  onRetry,
  skeletonCount = 4,
  children,
}: QueryLoadStateProps) {
  if (isLoading) {
    return (
      <div aria-live="polite" aria-busy="true" className="space-y-3">
        {loadingLabel && <p className="text-sm text-text-muted">{loadingLabel}</p>}
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-card" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div aria-live="polite" role="alert" className="space-y-3 text-center">
        <p className="text-sm text-status-error">{errorLabel}</p>
        {onRetry && retryLabel && (
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            {retryLabel}
          </Button>
        )}
      </div>
    );
  }

  return children ?? null;
}
