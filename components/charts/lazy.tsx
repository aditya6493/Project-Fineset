import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const chartFallback = () => <Skeleton className="h-64 w-full rounded-card" />;

export const SalesLineChart = dynamic(
  () => import("./SalesLineChart").then((mod) => mod.SalesLineChart),
  { ssr: false, loading: chartFallback },
);

export const BreakdownBarChart = dynamic(
  () => import("./BreakdownBarChart").then((mod) => mod.BreakdownBarChart),
  { ssr: false, loading: chartFallback },
);

export const StoreConversionChart = dynamic(
  () => import("./StoreConversionChart").then((mod) => mod.StoreConversionChart),
  { ssr: false, loading: chartFallback },
);

export const RevenueByStoreChart = dynamic(
  () => import("./RevenueByStoreChart").then((mod) => mod.RevenueByStoreChart),
  { ssr: false, loading: chartFallback },
);
