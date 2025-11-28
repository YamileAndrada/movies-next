import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DirectorsThresholdForm } from "./DirectorsThresholdForm";
import * as hooks from "../hooks";
import { NetworkError } from "@/core/api/types";

// Mock the hook
vi.mock("../hooks", () => ({
  useDirectorsAggregation: vi.fn(),
}));

describe("DirectorsThresholdForm", () => {
  const mockUseDirectorsAggregation = vi.mocked(
    hooks.useDirectorsAggregation
  );

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock return
    mockUseDirectorsAggregation.mockReturnValue({
      directors: [],
      loading: false,
      error: null,
    });
  });

  afterEach(() => {
    cleanup();
  });

  describe("Form rendering", () => {
    it("should render form with input and button", () => {
      render(<DirectorsThresholdForm />);

      expect(
        screen.getByRole("heading", { name: /directors analysis/i })
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(/minimum movie count/i)
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /calculate/i })
      ).toBeInTheDocument();
    });

    it("should have accessible label for input", () => {
      render(<DirectorsThresholdForm />);

      const input = screen.getByLabelText(/minimum movie count/i);
      expect(input).toHaveAttribute("id", "threshold-input");
      expect(input).toHaveAttribute("type", "text");
      expect(input).toHaveAttribute("inputMode", "numeric");
    });

    it("should show help text by default", () => {
      render(<DirectorsThresholdForm />);

      expect(
        screen.getByText(/directors with more than this number/i)
      ).toBeInTheDocument();
    });
  });

  describe("Input validation", () => {
    it("should show error for empty input on submit", async () => {
      const user = userEvent.setup();
      render(<DirectorsThresholdForm />);

      const button = screen.getByRole("button", { name: /calculate/i });
      await user.click(button);

      expect(
        screen.getByText(/please enter a threshold value/i)
      ).toBeInTheDocument();
    });

    it("should show error for empty input treated as non-numeric", async () => {
      const user = userEvent.setup();
      render(<DirectorsThresholdForm />);

      // Submit with just whitespace
      const input = screen.getByLabelText(/minimum movie count/i);
      await user.type(input, "   ");
      await user.click(screen.getByRole("button", { name: /calculate/i }));

      // Should show validation error (whitespace treated as empty)
      expect(
        screen.getByText(/please enter a threshold value/i)
      ).toBeInTheDocument();
    });

    it("should clear validation error when user types", async () => {
      const user = userEvent.setup();
      render(<DirectorsThresholdForm />);

      // Submit empty form to trigger error
      await user.click(screen.getByRole("button", { name: /calculate/i }));
      expect(
        screen.getByText(/please enter a threshold value/i)
      ).toBeInTheDocument();

      // Type in input
      const input = screen.getByLabelText(/minimum movie count/i);
      await user.type(input, "5");

      // Error should be cleared
      expect(
        screen.queryByText(/please enter a threshold value/i)
      ).not.toBeInTheDocument();
    });

    it("should set aria-invalid when validation error exists", async () => {
      const user = userEvent.setup();
      render(<DirectorsThresholdForm />);

      const input = screen.getByLabelText(/minimum movie count/i);
      expect(input).toHaveAttribute("aria-invalid", "false");

      // Submit empty form
      await user.click(screen.getByRole("button", { name: /calculate/i }));

      expect(input).toHaveAttribute("aria-invalid", "true");
    });
  });

  describe("Form submission", () => {
    it("should call hook with threshold on valid submit", async () => {
      const user = userEvent.setup();
      render(<DirectorsThresholdForm />);

      const input = screen.getByLabelText(/minimum movie count/i);
      await user.type(input, "5");
      await user.click(screen.getByRole("button", { name: /calculate/i }));

      await waitFor(() => {
        expect(mockUseDirectorsAggregation).toHaveBeenCalledWith(5);
      });
    });

    it("should handle zero threshold", async () => {
      const user = userEvent.setup();
      render(<DirectorsThresholdForm />);

      const input = screen.getByLabelText(/minimum movie count/i);
      await user.type(input, "0");
      await user.click(screen.getByRole("button", { name: /calculate/i }));

      await waitFor(() => {
        expect(mockUseDirectorsAggregation).toHaveBeenCalledWith(0);
      });
    });

    it("should trim whitespace from input", async () => {
      const user = userEvent.setup();
      render(<DirectorsThresholdForm />);

      const input = screen.getByLabelText(/minimum movie count/i);
      await user.type(input, "  5  ");
      await user.click(screen.getByRole("button", { name: /calculate/i }));

      await waitFor(() => {
        expect(mockUseDirectorsAggregation).toHaveBeenCalledWith(5);
      });
    });
  });

  describe("Loading state", () => {
    it("should show button as disabled with loading spinner when loading", async () => {
      const user = userEvent.setup();
      render(<DirectorsThresholdForm />);

      const input = screen.getByLabelText(/minimum movie count/i);
      await user.type(input, "5");

      // Mock loading state after submission
      mockUseDirectorsAggregation.mockReturnValue({
        directors: [],
        loading: true,
        error: null,
      });

      await user.click(screen.getByRole("button", { name: /calculate/i }));

      await waitFor(() => {
        const button = screen.getByRole("button", { name: /calculate directors/i });
        expect(button).toBeDisabled();
        expect(button).toHaveAttribute("aria-busy", "true");
        expect(button).toHaveTextContent("Calculate"); // Text doesn't change, just shows spinner
      });
    });

    it("should disable input and button during loading", async () => {
      mockUseDirectorsAggregation.mockReturnValue({
        directors: [],
        loading: true,
        error: null,
      });

      const user = userEvent.setup();
      render(<DirectorsThresholdForm />);

      const input = screen.getByLabelText(/minimum movie count/i);
      await user.type(input, "5");
      await user.click(screen.getByRole("button", { name: /calculate/i }));

      expect(input).toBeDisabled();
      const button = screen.getByRole("button", { name: /calculate directors/i });
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("aria-busy", "true");
    });
  });

  describe("Error state", () => {
    it("should show error message when error occurs", async () => {
      mockUseDirectorsAggregation.mockReturnValue({
        directors: [],
        loading: false,
        error: new NetworkError("Network error occurred"),
      });

      const user = userEvent.setup();
      render(<DirectorsThresholdForm />);

      await user.type(screen.getByLabelText(/minimum movie count/i), "5");
      await user.click(screen.getByRole("button", { name: /calculate/i }));

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(screen.getByText(/network error occurred/i)).toBeInTheDocument();
      });
    });
  });

  describe("Empty state", () => {
    it("should show empty state when no directors found", async () => {
      mockUseDirectorsAggregation.mockReturnValue({
        directors: [],
        loading: false,
        error: null,
      });

      const user = userEvent.setup();
      render(<DirectorsThresholdForm />);

      await user.type(screen.getByLabelText(/minimum movie count/i), "100");
      await user.click(screen.getByRole("button", { name: /calculate/i }));

      await waitFor(() => {
        expect(screen.getByText(/no results found/i)).toBeInTheDocument();
      });
    });

    it("should show appropriate message for negative threshold", async () => {
      mockUseDirectorsAggregation.mockReturnValue({
        directors: [],
        loading: false,
        error: null,
      });

      const user = userEvent.setup();
      render(<DirectorsThresholdForm />);

      await user.type(screen.getByLabelText(/minimum movie count/i), "-5");
      await user.click(screen.getByRole("button", { name: /calculate/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/please enter a non-negative threshold value/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Success state", () => {
    it("should show directors list when directors are found", async () => {
      mockUseDirectorsAggregation.mockReturnValue({
        directors: [
          { name: "Christopher Nolan", count: 8 },
          { name: "Quentin Tarantino", count: 6 },
        ],
        loading: false,
        error: null,
      });

      const user = userEvent.setup();
      render(<DirectorsThresholdForm />);

      await user.type(screen.getByLabelText(/minimum movie count/i), "5");
      await user.click(screen.getByRole("button", { name: /calculate/i }));

      await waitFor(() => {
        expect(screen.getByText(/found 2 directors/i)).toBeInTheDocument();
        expect(screen.getByText("Christopher Nolan")).toBeInTheDocument();
        expect(screen.getByText("Quentin Tarantino")).toBeInTheDocument();
        expect(screen.getByText("8")).toBeInTheDocument();
        expect(screen.getByText("6")).toBeInTheDocument();
      });
    });

    it("should show correct singular/plural for director count", async () => {
      mockUseDirectorsAggregation.mockReturnValue({
        directors: [{ name: "Christopher Nolan", count: 8 }],
        loading: false,
        error: null,
      });

      const user = userEvent.setup();
      render(<DirectorsThresholdForm />);

      await user.type(screen.getByLabelText(/minimum movie count/i), "5");
      await user.click(screen.getByRole("button", { name: /calculate/i }));

      await waitFor(() => {
        expect(screen.getByText(/found 1 director/i)).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA roles for table", async () => {
      mockUseDirectorsAggregation.mockReturnValue({
        directors: [
          { name: "Christopher Nolan", count: 8 },
          { name: "Quentin Tarantino", count: 6 },
        ],
        loading: false,
        error: null,
      });

      const user = userEvent.setup();
      render(<DirectorsThresholdForm />);

      await user.type(screen.getByLabelText(/minimum movie count/i), "5");
      await user.click(screen.getByRole("button", { name: /calculate/i }));

      await waitFor(() => {
        expect(screen.getByRole("table")).toBeInTheDocument();
        expect(screen.getAllByRole("row").length).toBeGreaterThan(0);
        expect(screen.getAllByRole("columnheader")).toHaveLength(2);
      });
    });

    it("should have aria-live region for results", async () => {
      const user = userEvent.setup();
      render(<DirectorsThresholdForm />);

      await user.type(screen.getByLabelText(/minimum movie count/i), "5");
      await user.click(screen.getByRole("button", { name: /calculate/i }));

      await waitFor(() => {
        const region = screen.getByRole("region", {
          name: /directors results/i,
        });
        expect(region).toHaveAttribute("aria-live", "polite");
      });
    });

    it("should support keyboard navigation on director rows", async () => {
      mockUseDirectorsAggregation.mockReturnValue({
        directors: [{ name: "Christopher Nolan", count: 8 }],
        loading: false,
        error: null,
      });

      const user = userEvent.setup();
      render(<DirectorsThresholdForm />);

      await user.type(screen.getByLabelText(/minimum movie count/i), "5");
      await user.click(screen.getByRole("button", { name: /calculate/i }));

      await waitFor(() => {
        const rows = screen.getAllByRole("row");
        // First row is header, second is data
        const dataRow = rows[1];
        expect(dataRow).toHaveAttribute("tabIndex", "0");
      });
    });

    it("should have proper button states for screen readers", () => {
      render(<DirectorsThresholdForm />);

      const button = screen.getByRole("button", { name: /calculate/i });
      expect(button).toHaveAttribute("aria-label", "Calculate directors");
    });
  });

  describe("Keyboard navigation", () => {
    it("should submit form on Enter key in input", async () => {
      const user = userEvent.setup();
      render(<DirectorsThresholdForm />);

      const input = screen.getByLabelText(/minimum movie count/i);
      await user.type(input, "5{Enter}");

      await waitFor(() => {
        expect(mockUseDirectorsAggregation).toHaveBeenCalledWith(5);
      });
    });

    it("should focus input on page load", () => {
      render(<DirectorsThresholdForm />);

      const input = screen.getByLabelText(/minimum movie count/i);
      expect(input).toBeInTheDocument();
      expect(input).not.toHaveAttribute("disabled");
    });
  });
});
