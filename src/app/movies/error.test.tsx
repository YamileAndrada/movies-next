import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MoviesError from "./error";

// Helper to get first element when strict mode causes duplicates
const getFirstByText = (text: string | RegExp) => screen.getAllByText(text)[0];
const getFirstByRole = (role: string, options?: any) =>
  screen.getAllByRole(role, options)[0];

describe("MoviesError", () => {
  const mockReset = vi.fn();
  const mockError = new Error("Test error message");

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console.error to avoid noise in test output
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("Rendering", () => {
    it("renders error heading", () => {
      render(<MoviesError error={mockError} reset={mockReset} />);

      expect(getFirstByText(/something went wrong/i)).toBeInTheDocument();
    });

    it("renders error description", () => {
      render(<MoviesError error={mockError} reset={mockReset} />);

      expect(
        getFirstByText(/we encountered an error while loading the movies page/i)
      ).toBeInTheDocument();
    });

    it("displays error message", () => {
      render(<MoviesError error={mockError} reset={mockReset} />);

      expect(getFirstByText("Test error message")).toBeInTheDocument();
    });

    it("renders try again button", () => {
      render(<MoviesError error={mockError} reset={mockReset} />);

      expect(getFirstByRole("button", { name: /try again/i })).toBeInTheDocument();
    });

    it("renders go home link", () => {
      render(<MoviesError error={mockError} reset={mockReset} />);

      const link = getFirstByRole("link", { name: /go home/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/");
    });
  });

  describe("Error Logging", () => {
    it("logs error to console", () => {
      const consoleErrorSpy = vi.spyOn(console, "error");

      render(<MoviesError error={mockError} reset={mockReset} />);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Movies page error:",
        mockError
      );
    });
  });

  describe("User Interactions", () => {
    it("calls reset when try again button is clicked", async () => {
      render(<MoviesError error={mockError} reset={mockReset} />);

      const tryAgainButton = getFirstByRole("button", { name: /try again/i });
      await userEvent.click(tryAgainButton);

      expect(mockReset).toHaveBeenCalledTimes(1);
    });
  });

  describe("Error with digest", () => {
    it("displays error with digest", () => {
      const errorWithDigest = Object.assign(new Error("Error with digest"), {
        digest: "abc123",
      });

      render(<MoviesError error={errorWithDigest} reset={mockReset} />);

      expect(getFirstByText("Error with digest")).toBeInTheDocument();
    });
  });

  describe("Layout and Styling", () => {
    it("renders with proper layout", () => {
      const { container } = render(
        <MoviesError error={mockError} reset={mockReset} />
      );

      const main = container.querySelector("main");
      expect(main).toBeInTheDocument();
      expect(main).toHaveClass("min-h-screen");
    });

    it("renders error icon", () => {
      const { container } = render(
        <MoviesError error={mockError} reset={mockReset} />
      );

      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper heading hierarchy", () => {
      render(<MoviesError error={mockError} reset={mockReset} />);

      const headings = screen.queryAllByRole("heading", { level: 1 });
      expect(headings.length).toBeGreaterThan(0);
      expect(headings[0]).toHaveTextContent(/something went wrong/i);
    });

    it("try again button is keyboard accessible", async () => {
      render(<MoviesError error={mockError} reset={mockReset} />);

      const button = getFirstByRole("button", { name: /try again/i });
      button.focus();

      expect(document.activeElement).toBe(button);

      await userEvent.keyboard("{Enter}");
      expect(mockReset).toHaveBeenCalledTimes(1);
    });

    it("go home link is keyboard accessible", () => {
      render(<MoviesError error={mockError} reset={mockReset} />);

      const link = getFirstByRole("link", { name: /go home/i });
      link.focus();

      expect(document.activeElement).toBe(link);
    });
  });
});
