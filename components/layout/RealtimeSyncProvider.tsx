"use client";

import { useRealtimeSync } from "@/hooks/useRealtimeSync";

interface RealtimeSyncProviderProps {
  children: React.ReactNode;
}

export function RealtimeSyncProvider({ children }: RealtimeSyncProviderProps) {
  useRealtimeSync();
  return children;
}
