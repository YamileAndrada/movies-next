import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DirectorsError from "./error";

describe("DirectorsError", () => {
  const mockReset = vi.fn();
  const mockError = new Error("Test error message");

  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console.error for tests
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
  });

  it("should render error message", () => {
    render(<DirectorsError error={mockError} reset={mockReset} />);

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText("Test error message")).toBeInTheDocument();
  });

  it("should call reset when Try again button is clicked", async () => {
    const user = userEvent.setup();
    render(<DirectorsError error={mockError} reset={mockReset} />);

    const tryAgainButton = screen.getByRole("button", { name: /try again/i });
    await user.click(tryAgainButton);

    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it("should have link to home page", () => {
    render(<DirectorsError error={mockError} reset={mockReset} />);

    const homeLink = screen.getByRole("link", { name: /go home/i });
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("should display error digest if provided", () => {
    const errorWithDigest = Object.assign(mockError, {
      digest: "abc123",
    });

    render(<DirectorsError error={errorWithDigest} reset={mockReset} />);

    expect(screen.getByText(/error id: abc123/i)).toBeInTheDocument();
  });

  it("should not display error digest if not provided", () => {
    // Create a fresh error without digest
    const errorWithoutDigest = new Error("Test error message");
    render(<DirectorsError error={errorWithoutDigest} reset={mockReset} />);

    expect(screen.queryByText(/error id:/i)).not.toBeInTheDocument();
  });

  it("should log error to console", () => {
    const consoleSpy = vi.spyOn(console, "error");
    render(<DirectorsError error={mockError} reset={mockReset} />);

    expect(consoleSpy).toHaveBeenCalledWith(
      "Directors page error:",
      mockError
    );
  });

  it("should have accessible error icon", () => {
    const { container } = render(
      <DirectorsError error={mockError} reset={mockReset} />
    );

    const icon = container.querySelector('svg[aria-hidden="true"]');
    expect(icon).toBeInTheDocument();
  });
});
