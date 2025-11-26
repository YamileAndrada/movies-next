import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import DirectorsPage from "./page";

// Mock the DirectorsThresholdForm component
vi.mock("@/features/directors/components", () => ({
  DirectorsThresholdForm: () => (
    <div data-testid="directors-threshold-form">
      Mocked DirectorsThresholdForm
    </div>
  ),
}));

describe("DirectorsPage", () => {
  afterEach(() => {
    cleanup();
  });

  it("should render the page", () => {
    render(<DirectorsPage />);

    expect(
      screen.getByTestId("directors-threshold-form")
    ).toBeInTheDocument();
  });

  it("should have responsive layout", () => {
    const { container } = render(<DirectorsPage />);

    const formContainer = container.querySelector('[data-testid="directors-threshold-form"]')?.parentElement;
    expect(formContainer).toHaveClass("container", "mx-auto");
  });

  it("should have gradient background", () => {
    const { container } = render(<DirectorsPage />);

    const bgDiv = container.firstChild as HTMLElement;
    expect(bgDiv).toHaveClass("min-h-screen", "bg-gradient-to-br");
  });
});
