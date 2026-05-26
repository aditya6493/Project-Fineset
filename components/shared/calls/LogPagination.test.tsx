// @vitest-environment jsdom
import { describe, expect, it, vi, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LogPagination } from "./LogPagination";

afterEach(() => {
  cleanup();
});

describe("LogPagination", () => {
  it("disables previous on first page and next on last page", () => {
    const onPageChange = vi.fn();

    render(
      <LogPagination
        page={1}
        totalPages={3}
        showingLabel="Showing 1-15"
        pageLabel="Page 1 of 3"
        previousLabel="Previous"
        nextLabel="Next"
        onPageChange={onPageChange}
      />,
    );

    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
  });

  it("calls onPageChange when next is clicked", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <LogPagination
        page={1}
        totalPages={3}
        showingLabel=""
        pageLabel="Page 1 of 3"
        previousLabel="Previous"
        nextLabel="Next"
        onPageChange={onPageChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
