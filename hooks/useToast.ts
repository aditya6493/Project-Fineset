"use client";

import { useSyncExternalStore } from "react";

export interface ToastItem {
  id: string;
  title?: string;
  description?: string;
}

let toasts: ToastItem[] = [];
let toastCounter = 0;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function toast(options: { title?: string; description?: string }) {
  const id = String(++toastCounter);
  toasts = [...toasts, { id, ...options }];
  emit();
  window.setTimeout(() => {
    toasts = toasts.filter((item) => item.id !== id);
    emit();
  }, 4000);
}

export function useToastStore(): ToastItem[] {
  return useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      return () => listeners.delete(onStoreChange);
    },
    () => toasts,
    () => toasts,
  );
}
