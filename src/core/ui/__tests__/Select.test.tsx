import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Select } from "@/core/ui";

describe("Select", () => {
  const options = [
    { value: "a", label: "Option A" },
    { value: "b", label: "Option B" },
  ];

  it("renders options and label", () => {
    render(<Select label="Choose" options={options} />);
    const select = screen.getByLabelText(/choose/i) as HTMLSelectElement;
    expect(select).toBeInTheDocument();
    // options should be present
    expect(screen.getByText(/option a/i)).toBeInTheDocument();
    expect(screen.getByText(/option b/i)).toBeInTheDocument();
  });
});
