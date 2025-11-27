import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Input } from "@/core/ui";

describe("Input", () => {
  it("renders label and input and displays error", () => {
    render(<Input label="Name" error="Required" />);
    const input = screen.getByLabelText(/name/i) as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("aria-invalid", "true");
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/required/i);
  });
});
