import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MoviesFilters } from "./MoviesFilters";

// Helper to get first element when strict mode causes duplicates
const getFirstByLabel = (label: RegExp) => screen.getAllByLabelText(label)[0];
const getFirstByRole = (role: string, options?: any) => screen.getAllByRole(role, options)[0];

describe("MoviesFilters", () => {
  const mockOnFiltersChange = vi.fn();

  const defaultProps = {
    filters: {},
    onFiltersChange: mockOnFiltersChange,
    availableGenres: ["Action", "Comedy", "Drama"],
    availableDirectors: ["Christopher Nolan", "Steven Spielberg", "Quentin Tarantino"],
    realtimeFiltering: false, // Disable realtime for easier testing
    debounceMs: 50,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders all filter inputs", () => {
      render(<MoviesFilters {...defaultProps} />);

      expect(getFirstByLabel(/title/i)).toBeInTheDocument();
      expect(getFirstByLabel(/year from/i)).toBeInTheDocument();
      expect(getFirstByLabel(/year to/i)).toBeInTheDocument();
      expect(getFirstByRole("group", { name: /genre filters/i })).toBeInTheDocument();
      expect(getFirstByLabel(/director/i)).toBeInTheDocument();
    });

    it("renders genre checkboxes", () => {
      render(<MoviesFilters {...defaultProps} />);

      const checkboxes = screen.queryAllByRole("checkbox");
      expect(checkboxes.length).toBeGreaterThanOrEqual(3);
    });

    it("renders apply filters button when realtime disabled", () => {
      render(<MoviesFilters {...defaultProps} realtimeFiltering={false} />);

      const buttons = screen.queryAllByRole("button", { name: /apply filters/i });
      expect(buttons.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Title Filter", () => {
    it("accepts text input", async () => {
      render(<MoviesFilters {...defaultProps} />);

      const input = getFirstByLabel(/title/i) as HTMLInputElement;
      await userEvent.type(input, "matrix");

      expect(input.value).toBe("matrix");
    });

    it("calls onFiltersChange on submit", async () => {
      render(<MoviesFilters {...defaultProps} realtimeFiltering={false} />);

      const input = getFirstByLabel(/title/i);
      await userEvent.clear(input);
      await userEvent.type(input, "matrix");

      const submitButton = getFirstByRole("button", { name: /apply filters/i });
      await userEvent.click(submitButton);

      expect(mockOnFiltersChange).toHaveBeenCalled();
      const call = mockOnFiltersChange.mock.calls[0][0];
      expect(call.title).toBe("matrix");
    });
  });

  describe("Year Range Filters", () => {
    it("accepts year from input", async () => {
      render(<MoviesFilters {...defaultProps} />);

      const input = getFirstByLabel(/year from/i) as HTMLInputElement;
      await userEvent.type(input, "2000");

      expect(input.value).toBe("2000");
    });

    it("accepts year to input", async () => {
      render(<MoviesFilters {...defaultProps} />);

      const input = getFirstByLabel(/year to/i) as HTMLInputElement;
      await userEvent.type(input, "2020");

      expect(input.value).toBe("2020");
    });
  });

  describe("Genre Multi-Select", () => {
    it("allows selecting genres", async () => {
      render(<MoviesFilters {...defaultProps} />);

      const checkboxes = screen.queryAllByRole("checkbox");
      const firstCheckbox = checkboxes[0] as HTMLInputElement;

      await userEvent.click(firstCheckbox);

      expect(firstCheckbox.checked).toBe(true);
    });
  });

  describe("Director Autocomplete", () => {
    it("accepts director input", async () => {
      render(<MoviesFilters {...defaultProps} />);

      const input = getFirstByLabel(/director/i) as HTMLInputElement;
      await userEvent.type(input, "nolan");

      expect(input.value).toBe("nolan");
    });
  });

  describe("Clear All Filters", () => {
    it("clears inputs when clicked", async () => {
      render(<MoviesFilters {...defaultProps} filters={{ title: "matrix" }} />);

      const clearButton = getFirstByRole("button", { name: /clear all/i });
      await userEvent.click(clearButton);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({});
    });
  });

  describe("Form Submission", () => {
    it("submits filters on button click", async () => {
      render(<MoviesFilters {...defaultProps} realtimeFiltering={false} />);

      const titleInput = getFirstByLabel(/title/i);
      await userEvent.type(titleInput, "matrix");

      const submitButton = getFirstByRole("button", { name: /apply filters/i });
      await userEvent.click(submitButton);

      expect(mockOnFiltersChange).toHaveBeenCalled();
      expect(mockOnFiltersChange.mock.calls[0][0]).toHaveProperty("title", "matrix");
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels", () => {
      render(<MoviesFilters {...defaultProps} />);

      expect(getFirstByLabel(/title/i)).toHaveAttribute("id", "title-filter");
      expect(getFirstByLabel(/year from/i)).toHaveAttribute("id", "year-from");
      expect(getFirstByLabel(/year to/i)).toHaveAttribute("id", "year-to");
      expect(getFirstByLabel(/director/i)).toHaveAttribute("id", "director-filter");
    });

    it("has descriptive help text", () => {
      render(<MoviesFilters {...defaultProps} />);

      const helpTexts = screen.queryAllByText(/case-insensitive partial match/i);
      expect(helpTexts.length).toBeGreaterThan(0);
    });

    it("has genre group with proper ARIA role", () => {
      render(<MoviesFilters {...defaultProps} />);

      const genreGroup = getFirstByRole("group", { name: /genre filters/i });
      expect(genreGroup).toBeInTheDocument();
    });

    it("has director autocomplete with proper ARIA attributes", () => {
      render(<MoviesFilters {...defaultProps} />);

      const input = getFirstByLabel(/director/i);
      expect(input).toHaveAttribute("aria-autocomplete", "list");
      expect(input).toHaveAttribute("aria-controls", "director-suggestions");
    });
  });
});
