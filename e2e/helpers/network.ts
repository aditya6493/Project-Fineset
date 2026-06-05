import type { Page, Request } from "@playwright/test";

export function createRequestCounter(page: Page, urlPattern: string | RegExp) {
  const matches: Request[] = [];

  const handler = (request: Request) => {
    const url = request.url();
    const hit =
      typeof urlPattern === "string"
        ? url.includes(urlPattern)
        : urlPattern.test(url);
    if (hit) matches.push(request);
  };

  page.on("request", handler);

  return {
    count: () => matches.length,
    reset: () => {
      matches.length = 0;
    },
    stop: () => {
      page.off("request", handler);
    },
  };
}

export async function waitMs(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
