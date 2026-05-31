import { spawnSync } from "node:child_process";
import { createSerwistRoute } from "@serwist/turbopack";
import { PWA_ASSET_VERSION } from "@/lib/pwa/config";

const gitRevision =
  spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout?.trim() ||
  "dev";

const revision = `${gitRevision}-${PWA_ASSET_VERSION}`;

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
  createSerwistRoute({
    additionalPrecacheEntries: [{ url: "/~offline", revision }],
    swSrc: "app/sw.ts",
    useNativeEsbuild: true,
  });
