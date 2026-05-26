"use client";

interface BreakdownBarChartProps {
  title: string;
  data: Array<{ label: string; count: number }>;
  emptyMessage?: string;
}

export function BreakdownBarChart({
  title,
  data,
  emptyMessage = "No data for this period",
}: BreakdownBarChartProps) {
  const maxCount = Math.max(...data.map((item) => item.count), 1);

  return (
    <div className="rounded-card border border-border bg-surface-card p-4 shadow-card sm:p-6">
      <h3 className="mb-4 font-display text-lg font-semibold text-text-primary">
        {title}
      </h3>
      {data.length === 0 ? (
        <p className="text-sm text-text-muted">{emptyMessage}</p>
      ) : (
        <ul className="space-y-3">
          {data.map((item) => (
            <li key={item.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-text-secondary">{item.label}</span>
                <span className="font-medium text-text-primary">{item.count}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-secondary">
                <div
                  className="h-full rounded-full bg-brand-gold transition-all"
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
