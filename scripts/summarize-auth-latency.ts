/**
 * Summarize auth after-login timing logs from app/api/auth/after-login/route.ts
 *
 * Usage:
 *   npm run auth:latency -- <path-to-log-file>
 *
 * Example:
 *   npm run auth:latency -- ".cursor/projects/.../terminals/7.txt"
 */
import { readFileSync } from "node:fs";

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil((p / 100) * sorted.length) - 1),
  );
  return sorted[idx] ?? 0;
}

function stats(values: number[]) {
  if (values.length === 0) {
    return { count: 0, p50: 0, p95: 0, max: 0, avg: 0 };
  }
  const sum = values.reduce((acc, n) => acc + n, 0);
  return {
    count: values.length,
    p50: percentile(values, 50),
    p95: percentile(values, 95),
    max: Math.max(...values),
    avg: Math.round(sum / values.length),
  };
}

function main(): void {
  const path = process.argv[2];
  if (!path) {
    console.error("Usage: npm run auth:latency -- <path-to-log-file>");
    process.exit(1);
  }

  const content = readFileSync(path, "utf8");
  const lines = content.split(/\r?\n/);

  const totals: number[] = [];
  const outcomeCounts: Record<string, number> = {};
  const stepValues: Record<string, number[]> = {};

  for (const line of lines) {
    const nextRouteMatch = line.match(
      /POST \/api\/auth\/after-login\s+(\d+)\s+in\s+([\d.]+)(ms|s)/i,
    );
    if (nextRouteMatch) {
      const status = nextRouteMatch[1] ?? "unknown";
      const value = Number(nextRouteMatch[2] ?? "0");
      const unit = nextRouteMatch[3] ?? "ms";
      const totalMs = unit.toLowerCase() === "s" ? Math.round(value * 1000) : value;
      totals.push(totalMs);
      const key = `route_${status}`;
      outcomeCounts[key] = (outcomeCounts[key] ?? 0) + 1;
    }

    if (!line.includes("[auth.after-login]")) continue;

    const jsonPayload = line.match(/\[auth\.after-login\]\s+(\{.*\})$/);
    if (jsonPayload?.[1]) {
      try {
        const parsed = JSON.parse(jsonPayload[1]) as {
          event?: string;
          totalMs?: number;
          timings?: Record<string, number>;
        };
        if (parsed.event) {
          outcomeCounts[parsed.event] = (outcomeCounts[parsed.event] ?? 0) + 1;
        }
        if (typeof parsed.totalMs === "number") {
          totals.push(parsed.totalMs);
        }
        if (parsed.timings && typeof parsed.timings === "object") {
          for (const [key, value] of Object.entries(parsed.timings)) {
            if (typeof value !== "number") continue;
            stepValues[key] ??= [];
            stepValues[key].push(value);
          }
        }
        continue;
      } catch {
        // Fall back to legacy parser below.
      }
    }

    const outcomeMatch = line.match(/\[auth\.after-login\]\s+([a-z-]+)/i);
    if (outcomeMatch?.[1]) {
      const outcome = outcomeMatch[1];
      outcomeCounts[outcome] = (outcomeCounts[outcome] ?? 0) + 1;
    }

    const totalMatch = line.match(/totalMs:\s*(\d+)/);
    if (totalMatch?.[1]) {
      totals.push(Number(totalMatch[1]));
    }

    const timingsMatch = line.match(/timings:\s*\{([^}]*)\}/);
    if (!timingsMatch?.[1]) continue;

    const pairs = timingsMatch[1].matchAll(/([A-Za-z]\w*):\s*(\d+)/g);
    for (const pair of pairs) {
      const key = pair[1];
      const value = Number(pair[2]);
      if (!key) continue;
      stepValues[key] ??= [];
      stepValues[key].push(value);
    }
  }

  console.log("Auth After-Login Latency Summary");
  console.log("--------------------------------");
  console.log("Outcomes:", outcomeCounts);
  console.log("Total latency (ms):", stats(totals));

  const stepNames = Object.keys(stepValues).sort();
  if (stepNames.length === 0) {
    console.log("No per-step timings found.");
    return;
  }

  console.log("\nPer-step latency (ms):");
  for (const step of stepNames) {
    console.log(`- ${step}:`, stats(stepValues[step] ?? []));
  }
}

main();
