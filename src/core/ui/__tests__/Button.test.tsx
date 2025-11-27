import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/core/ui";

describe("Button", () => {
  it("renders children and triggers click", async () => {
    const user = userEvent.setup();
    const handle = vi.fn();
    render(<Button onClick={handle}>Click me</Button>);

    const btn = screen.getByRole("button", { name: /click me/i });
    await user.click(btn);
    expect(handle).toHaveBeenCalled();
  });

  it("shows loading spinner and is disabled when loading", () => {
    render(<Button loading>Saving</Button>);
    const btn = screen.getByRole("button", { name: /saving/i });
    expect(btn).toBeDisabled();
    const spinner = btn.querySelector("svg");
    expect(spinner).toBeTruthy();
  });
});
