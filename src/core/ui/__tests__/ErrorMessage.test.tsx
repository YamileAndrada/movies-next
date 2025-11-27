import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ErrorMessage } from "@/core/ui";

describe("ErrorMessage", () => {
  it("renders alert with message", () => {
    render(<ErrorMessage message="Something went wrong" />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/something went wrong/i);
  });
});
