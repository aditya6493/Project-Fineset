// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import * as assetRefresh from "@/lib/pwa/asset-refresh";
import { PwaAssetRefresh } from "@/components/pwa/PwaAssetRefresh";

describe("PwaAssetRefresh", () => {
  it("delegates to runPwaAssetRefresh on mount", async () => {
    const run = vi.spyOn(assetRefresh, "runPwaAssetRefresh").mockResolvedValue();
    render(<PwaAssetRefresh />);

    await waitFor(() => {
      expect(run).toHaveBeenCalledTimes(1);
    });
  });
});
