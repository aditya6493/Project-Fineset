/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterChip } from "@/components/shared/calls/FilterChip";
import {
  analyticsParamsMatch,
  staffCallsParamsMatch,
  visitsParamsMatch,
} from "@/lib/query/initial-data";

describe("FilterChip", () => {
  it("renders with aria-pressed when active", async () => {
    const user = userEvent.setup();
    let active = false;
    render(
      <FilterChip
        active={active}
        label="All"
        count={3}
        onClick={() => {
          active = true;
        }}
      />,
    );

    const button = screen.getByRole("button", { name: /All/i });
    expect(button).toHaveAttribute("aria-pressed", "false");
    await user.click(button);
  });
});

describe("initial-data param matchers", () => {
  it("matches default visits params", () => {
    expect(
      visitsParamsMatch(
        { page: "1", pageSize: "20", sortBy: "visitDate", sortOrder: "desc" },
        { page: "1", pageSize: "20", sortBy: "visitDate", sortOrder: "desc" },
      ),
    ).toBe(true);
  });

  it("matches default analytics period", () => {
    expect(analyticsParamsMatch({ period: "week" }, { period: "week" })).toBe(true);
  });

  it("matches default staff calls params", () => {
    const now = new Date();
    expect(
      staffCallsParamsMatch(
        {
          page: 1,
          pageSize: 15,
          year: now.getFullYear(),
          month: now.getMonth() + 1,
          segment: "ALL",
          valueTier: "ALL",
          queue: "ALL",
        },
        {
          page: 1,
          pageSize: 15,
          year: now.getFullYear(),
          month: now.getMonth() + 1,
          segment: "ALL",
          valueTier: "ALL",
          queue: "ALL",
        },
      ),
    ).toBe(true);
  });
});
