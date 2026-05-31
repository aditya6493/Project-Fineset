"use client";

import { useEffect, useState } from "react";

export function useChartCategoryAxisWidth(desktop = 110, mobile = 72): number {
  const [width, setWidth] = useState(mobile);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 640px)");
    const update = () => setWidth(mediaQuery.matches ? desktop : mobile);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, [desktop, mobile]);

  return width;
}
