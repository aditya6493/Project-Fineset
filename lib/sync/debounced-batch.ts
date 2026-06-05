/**
 * Coalesces rapid additions into a single flush after debounceMs of quiet time.
 */
export function createDebouncedBatch<T>(options: {
  debounceMs: number;
  onFlush: (items: T[]) => void;
}): {
  add: (item: T) => void;
  cancel: () => void;
} {
  const pending = new Set<T>();
  let timer: ReturnType<typeof setTimeout> | null = null;

  const flush = () => {
    timer = null;
    if (pending.size === 0) return;
    const batch = [...pending];
    pending.clear();
    options.onFlush(batch);
  };

  return {
    add(item: T) {
      pending.add(item);
      if (timer) clearTimeout(timer);
      timer = setTimeout(flush, options.debounceMs);
    },
    cancel() {
      if (timer) clearTimeout(timer);
      timer = null;
      pending.clear();
    },
  };
}
