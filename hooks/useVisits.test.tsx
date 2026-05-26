// @vitest-environment jsdom
import { describe, expect, it, beforeAll, afterAll, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { useVisits } from "./useVisits";

const server = setupServer(
  http.get("/api/visits", () =>
    HttpResponse.json({
      data: [
        {
          id: "visit-1",
          visitDate: "2026-05-01T10:00:00.000Z",
          staffName: "Alex",
          customerName: "Jane",
          customerPhone: "9876543210",
          purchaseStatus: "PURCHASED",
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    }),
  ),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useVisits", () => {
  it("fetches visits from the API", async () => {
    const { result } = renderHook(() => useVisits({ page: "1", pageSize: "20" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.total).toBe(1);
    expect(result.current.data?.data[0]?.customerName).toBe("Jane");
  });
});
