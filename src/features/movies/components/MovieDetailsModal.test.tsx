import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MovieDetailsModal } from "./MovieDetailsModal";
import type { NormalizedMovie } from "@/core/lib";

// Helper to get first element when strict mode causes duplicates
const getFirstByRole = (role: string, options?: any) =>
  screen.getAllByRole(role, options)[0];

describe("MovieDetailsModal", () => {
  const mockOnClose = vi.fn();

  const mockMovie: NormalizedMovie = {
    id: "1",
    title: "The Matrix",
    year: 1999,
    rated: "R",
    released: "1999-03-31",
    runtime: 136,
    genres: ["Action", "Sci-Fi"],
    directors: ["Lana Wachowski", "Lilly Wachowski"],
    writers: ["Lana Wachowski", "Lilly Wachowski"],
    actors: ["Keanu Reeves", "Laurence Fishburne", "Carrie-Anne Moss"],
    plot: "A computer hacker learns about the true nature of reality.",
    languages: ["English"],
    country: "USA",
    awards: "Won 4 Oscars",
    poster: "https://example.com/matrix.jpg",
    ratings: [{ source: "IMDB", value: "8.7/10" }],
    metascore: 73,
    imdbRating: 8.7,
    imdbVotes: 1500000,
    imdbID: "tt0133093",
    type: "movie",
    dvd: "1999-09-21",
    boxOffice: "$171,479,930",
    production: "Warner Bros.",
    website: "http://www.whatisthematrix.com",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders nothing when movie is null", () => {
      const { container } = render(
        <MovieDetailsModal movie={null} onClose={mockOnClose} />
      );

      expect(container.firstChild).toBeNull();
    });

    it("renders modal when movie is provided", () => {
      render(<MovieDetailsModal movie={mockMovie} onClose={mockOnClose} />);

      expect(
        getFirstByRole("dialog", { name: /the matrix/i })
      ).toBeInTheDocument();
    });

    it("displays movie title", () => {
      render(<MovieDetailsModal movie={mockMovie} onClose={mockOnClose} />);

      expect(screen.getAllByText("The Matrix")[0]).toBeInTheDocument();
    });

    it("displays all movie fields", () => {
      render(<MovieDetailsModal movie={mockMovie} onClose={mockOnClose} />);

      // Year
      expect(screen.getAllByText("1999")[0]).toBeInTheDocument();

      // Rated
      expect(screen.getAllByText("R")[0]).toBeInTheDocument();

      // Released
      expect(screen.getAllByText("1999-03-31")[0]).toBeInTheDocument();

      // Runtime
      expect(screen.getAllByText("136 minutes")[0]).toBeInTheDocument();

      // Genres
      expect(screen.getAllByText(/Action, Sci-Fi/i)[0]).toBeInTheDocument();

      // Directors
      expect(
        screen.getAllByText(/Lana Wachowski, Lilly Wachowski/i)[0]
      ).toBeInTheDocument();

      // Writers
      const writers = screen.queryAllByText(/Lana Wachowski, Lilly Wachowski/i);
      expect(writers.length).toBeGreaterThan(1); // Should appear in both directors and writers

      // Actors
      expect(
        screen.getAllByText(/Keanu Reeves, Laurence Fishburne/i)[0]
      ).toBeInTheDocument();
    });

    it("displays N/A for missing fields", () => {
      const movieWithMissingData: NormalizedMovie = {
        ...mockMovie,
        year: null,
        rated: "",
        released: "",
        runtime: 0,
        genres: [],
        directors: [],
        writers: [],
        actors: [],
      };

      render(
        <MovieDetailsModal movie={movieWithMissingData} onClose={mockOnClose} />
      );

      const naTexts = screen.queryAllByText("N/A");
      expect(naTexts.length).toBeGreaterThanOrEqual(8);
    });
  });

  describe("Accessibility", () => {
    it("has proper dialog role", () => {
      render(<MovieDetailsModal movie={mockMovie} onClose={mockOnClose} />);

      const dialog = getFirstByRole("dialog");
      expect(dialog).toHaveAttribute("role", "dialog");
    });

    it("has aria-modal attribute", () => {
      render(<MovieDetailsModal movie={mockMovie} onClose={mockOnClose} />);

      const dialog = getFirstByRole("dialog");
      expect(dialog).toHaveAttribute("aria-modal", "true");
    });

    it("has aria-labelledby pointing to title", () => {
      render(<MovieDetailsModal movie={mockMovie} onClose={mockOnClose} />);

      const dialog = getFirstByRole("dialog");
      expect(dialog).toHaveAttribute("aria-labelledby", "movie-title");

      const title = screen.getAllByText("The Matrix")[0];
      expect(title).toHaveAttribute("id", "movie-title");
    });

    it("has aria-describedby pointing to description", () => {
      render(<MovieDetailsModal movie={mockMovie} onClose={mockOnClose} />);

      const dialog = getFirstByRole("dialog");
      expect(dialog).toHaveAttribute("aria-describedby", "movie-description");
    });

    it("has close button with aria-label", () => {
      render(<MovieDetailsModal movie={mockMovie} onClose={mockOnClose} />);

      const closeButton = getFirstByRole("button", { name: /close modal/i });
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe("Close Functionality", () => {
    it("calls onClose when close button clicked", async () => {
      render(<MovieDetailsModal movie={mockMovie} onClose={mockOnClose} />);

      const closeButton = getFirstByRole("button", { name: /close modal/i });
      await userEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when Escape key pressed", async () => {
      render(<MovieDetailsModal movie={mockMovie} onClose={mockOnClose} />);

      await userEvent.keyboard("{Escape}");

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("calls onClose when backdrop clicked", async () => {
      const { container } = render(
        <MovieDetailsModal movie={mockMovie} onClose={mockOnClose} />
      );

      const backdrop = container.querySelector('[role="presentation"]');
      expect(backdrop).toBeInTheDocument();

      if (backdrop) {
        await userEvent.click(backdrop);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }
    });

    it("does not close when dialog content clicked", async () => {
      render(<MovieDetailsModal movie={mockMovie} onClose={mockOnClose} />);

      const dialog = getFirstByRole("dialog");
      await userEvent.click(dialog);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("Focus Management", () => {
    it("focuses close button when opened", async () => {
      render(<MovieDetailsModal movie={mockMovie} onClose={mockOnClose} />);

      const closeButtons = screen.queryAllByRole("button", {
        name: /close modal/i,
      });

      // Wait for focus - check that one of the buttons (due to strict mode) is focused
      await vi.waitFor(() => {
        const isFocused = closeButtons.some((btn) => document.activeElement === btn);
        expect(isFocused).toBe(true);
      });
    });

    it("traps focus within modal", async () => {
      render(<MovieDetailsModal movie={mockMovie} onClose={mockOnClose} />);

      const closeButtons = screen.queryAllByRole("button", {
        name: /close modal/i,
      });

      // Focus should start on close button
      await vi.waitFor(() => {
        const isFocused = closeButtons.some((btn) => document.activeElement === btn);
        expect(isFocused).toBe(true);
      });

      // Tab should cycle back to close button (only one focusable element)
      await userEvent.tab();
      const isFocusedAfterTab = closeButtons.some(
        (btn) => document.activeElement === btn
      );
      expect(isFocusedAfterTab).toBe(true);

      // Shift+Tab should also stay on close button
      await userEvent.tab({ shift: true });
      const isFocusedAfterShiftTab = closeButtons.some(
        (btn) => document.activeElement === btn
      );
      expect(isFocusedAfterShiftTab).toBe(true);
    });
  });

  describe("Body Scroll", () => {
    it("prevents body scroll when modal is open", () => {
      const { rerender } = render(
        <MovieDetailsModal movie={mockMovie} onClose={mockOnClose} />
      );

      expect(document.body.style.overflow).toBe("hidden");

      rerender(<MovieDetailsModal movie={null} onClose={mockOnClose} />);

      expect(document.body.style.overflow).toBe("");
    });

    it("restores body scroll on unmount", () => {
      const { unmount } = render(
        <MovieDetailsModal movie={mockMovie} onClose={mockOnClose} />
      );

      expect(document.body.style.overflow).toBe("hidden");

      unmount();

      expect(document.body.style.overflow).toBe("");
    });
  });

  describe("Edge Cases", () => {
    it("handles movie with null runtime", () => {
      const movieWithNullRuntime: NormalizedMovie = {
        ...mockMovie,
        runtime: 0,
      };

      render(
        <MovieDetailsModal movie={movieWithNullRuntime} onClose={mockOnClose} />
      );

      const naTexts = screen.queryAllByText("N/A");
      expect(naTexts.length).toBeGreaterThan(0);
    });

    it("handles empty arrays gracefully", () => {
      const movieWithEmptyArrays: NormalizedMovie = {
        ...mockMovie,
        genres: [],
        directors: [],
        writers: [],
        actors: [],
      };

      render(
        <MovieDetailsModal movie={movieWithEmptyArrays} onClose={mockOnClose} />
      );

      const naTexts = screen.queryAllByText("N/A");
      expect(naTexts.length).toBeGreaterThanOrEqual(4);
    });

    it("handles very long text content", () => {
      const movieWithLongText: NormalizedMovie = {
        ...mockMovie,
        actors: Array(20).fill("Actor Name"),
      };

      render(
        <MovieDetailsModal movie={movieWithLongText} onClose={mockOnClose} />
      );

      const dialog = getFirstByRole("dialog");
      expect(dialog).toBeInTheDocument();
    });
  });
});
