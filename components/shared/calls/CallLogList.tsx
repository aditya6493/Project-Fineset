"use client";

import { EmptyState } from "@/components/shared/EmptyState";
import { QueryLoadState } from "@/components/shared/QueryLoadState";
import { LogPagination } from "@/components/shared/calls";

interface CallLogListProps<T> {
  isLoading: boolean;
  isError: boolean;
  loadingLabel: string;
  errorLabel: string;
  retryLabel: string;
  onRetry: () => void;
  items: T[];
  emptyMessage: string;
  renderItem: (item: T) => React.ReactNode;
  page: number;
  totalPages: number;
  showingLabel: string;
  pageLabel: string;
  previousLabel: string;
  nextLabel: string;
  onPageChange: (page: number) => void;
}

export function CallLogList<T>({
  isLoading,
  isError,
  loadingLabel,
  errorLabel,
  retryLabel,
  onRetry,
  items,
  emptyMessage,
  renderItem,
  page,
  totalPages,
  showingLabel,
  pageLabel,
  previousLabel,
  nextLabel,
  onPageChange,
}: CallLogListProps<T>) {
  return (
    <>
      <QueryLoadState
        isLoading={isLoading}
        isError={isError}
        loadingLabel={loadingLabel}
        errorLabel={errorLabel}
        retryLabel={retryLabel}
        onRetry={onRetry}
      >
        {items.length === 0 ? (
          <EmptyState message={emptyMessage} />
        ) : (
          <div className="space-y-3">{items.map(renderItem)}</div>
        )}
      </QueryLoadState>

      {totalPages > 1 && (
        <LogPagination
          page={page}
          totalPages={totalPages}
          showingLabel={showingLabel}
          pageLabel={pageLabel}
          previousLabel={previousLabel}
          nextLabel={nextLabel}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
}
