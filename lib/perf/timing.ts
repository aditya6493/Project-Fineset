/** Lightweight perf logging for API routes (enable with PERF_LOG=true). */

export function isPerfLogEnabled(): boolean {
  return process.env.PERF_LOG === "true";
}

export function logPerf(
  route: string,
  timings: Record<string, number>,
  extra?: Record<string, unknown>,
): void {
  if (!isPerfLogEnabled()) return;
  console.info(
    "[perf]",
    JSON.stringify({
      route,
      ...timings,
      ...extra,
    }),
  );
}

export function createPerfTimer() {
  const startedAt = Date.now();
  let lastMark = startedAt;
  const marks: Record<string, number> = {};

  return {
    mark(label: string) {
      const now = Date.now();
      marks[label] = now - lastMark;
      lastMark = now;
    },
    finish(extra?: Record<string, number>) {
      return {
        totalMs: Date.now() - startedAt,
        ...marks,
        ...extra,
      };
    },
  };
}
