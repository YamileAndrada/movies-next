import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { SkeletonText } from "@/core/ui";

describe("Skeleton", () => {
  it("renders the requested number of lines", () => {
    const { container } = render(<SkeletonText lines={3} />);
    const pulses = container.querySelectorAll(".animate-pulse");
    expect(pulses.length).toBe(3);
  });
});
