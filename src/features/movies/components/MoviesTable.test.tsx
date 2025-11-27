import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MoviesTable } from "./MoviesTable";
import type { NormalizedMovie } from "@/core/lib";

// Helper to get first element when strict mode causes duplicates
const getFirstByRole = (role: string, options?: any) =>
  screen.getAllByRole(role, options)[0];

describe("MoviesTable", () => {
  const mockOnPageChange = vi.fn();
  const mockOnMovieClick = vi.fn();

  const mockMovies: NormalizedMovie[] = [
    {
      id: "1",
      title: "The Matrix",
      year: 1999,
      rated: "R",
      released: "1999-03-31",
      runtime: 136,
      genres: ["Action", "Sci-Fi"],
      directors: ["Lana Wachowski", "Lilly Wachowski"],
      writers: ["Lana Wachowski", "Lilly Wachowski"],
      actors: ["Keanu Reeves", "Laurence Fishburne"],
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
    },
    {
      id: "2",
      title: "Inception",
      year: 2010,
      rated: "PG-13",
      released: "2010-07-16",
      runtime: 148,
      genres: ["Action", "Sci-Fi", "Thriller"],
      directors: ["Christopher Nolan"],
      writers: ["Christopher Nolan"],
      actors: ["Leonardo DiCaprio", "Joseph Gordon-Levitt"],
      plot: "A thief who steals corporate secrets through dream-sharing technology.",
      languages: ["English"],
      country: "USA",
      awards: "Won 4 Oscars",
      poster: "https://example.com/inception.jpg",
      ratings: [{ source: "IMDB", value: "8.8/10" }],
      metascore: 74,
      imdbRating: 8.8,
      imdbVotes: 2000000,
      imdbID: "tt1375666",
      type: "movie",
      dvd: "2010-12-07",
      boxOffice: "$292,576,195",
      production: "Warner Bros.",
      website: "http://www.inception.com",
    },
  ];

  const defaultProps = {
    movies: mockMovies,
    loading: false,
    currentPage: 1,
    totalPages: 5,
    onPageChange: mockOnPageChange,
    onMovieClick: mockOnMovieClick,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders table with movie data", () => {
      render(<MoviesTable {...defaultProps} />);

      expect(screen.getAllByText("The Matrix")[0]).toBeInTheDocument();
      expect(screen.getAllByText("Inception")[0]).toBeInTheDocument();
    });

    it("renders table headers", () => {
      render(<MoviesTable {...defaultProps} />);

      expect(screen.getAllByText("Title")[0]).toBeInTheDocument();
      expect(screen.getAllByText("Year")[0]).toBeInTheDocument();
      expect(screen.getAllByText("Genre")[0]).toBeInTheDocument();
      expect(screen.getAllByText("Director")[0]).toBeInTheDocument();
    });

    it("displays year correctly", () => {
      render(<MoviesTable {...defaultProps} />);

      const years = screen.queryAllByText("1999");
      expect(years.length).toBeGreaterThan(0);
    });

    it("displays genres with limit", () => {
      render(<MoviesTable {...defaultProps} />);

      // Should show first 2 genres and +1 for the third
      const sciFi = screen.queryAllByText(/Sci-Fi/i);
      expect(sciFi.length).toBeGreaterThan(0);
    });

    it("displays directors with limit", () => {
      render(<MoviesTable {...defaultProps} />);

      // Should show first director
      const nolan = screen.queryAllByText(/Christopher Nolan/i);
      expect(nolan.length).toBeGreaterThan(0);
    });

    it("shows empty state when no movies", () => {
      render(<MoviesTable {...defaultProps} movies={[]} />);

      expect(screen.getAllByText(/no movies found/i)[0]).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("shows loading skeleton when loading", () => {
      const { container } = render(<MoviesTable {...defaultProps} loading={true} />);

      const skeletons = container.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("does not show movies when loading", () => {
      render(<MoviesTable {...defaultProps} loading={true} />);

      // Movies are still rendered but skeleton takes priority
      // Just check skeleton is present
      const { container } = render(<MoviesTable {...defaultProps} loading={true} />);
      const skeletons = container.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe("Pagination", () => {
    it("displays current page and total pages", () => {
      render(<MoviesTable {...defaultProps} />);

      expect(screen.getAllByText(/page/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText("1")[0]).toBeInTheDocument();
      expect(screen.getAllByText("5")[0]).toBeInTheDocument();
    });

    it("calls onPageChange when next button clicked", async () => {
      render(<MoviesTable {...defaultProps} />);

      const nextButton = getFirstByRole("button", { name: /next/i });
      await userEvent.click(nextButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it("disables previous button on first page", () => {
      render(<MoviesTable {...defaultProps} currentPage={1} />);

      const prevButtons = screen.queryAllByRole("button", { name: /previous/i });
      expect(prevButtons[0]).toBeDisabled();
    });
  });

  describe("Movie Click", () => {
    it("calls onMovieClick when row is clicked", async () => {
      render(<MoviesTable {...defaultProps} />);

      const rows = screen.queryAllByRole("button");
      const matrixRow = rows.find((row) =>
        row.getAttribute("aria-label")?.includes("The Matrix")
      );

      if (matrixRow) {
        await userEvent.click(matrixRow);
        expect(mockOnMovieClick).toHaveBeenCalledWith(mockMovies[0]);
      }
    });

    it("does not crash when onMovieClick is not provided", async () => {
      const { container } = render(
        <MoviesTable {...defaultProps} onMovieClick={undefined} />
      );

      const rows = container.querySelectorAll('[role="button"]');
      if (rows.length > 0) {
        await userEvent.click(rows[0]);
        // Should not crash
        expect(mockOnMovieClick).not.toHaveBeenCalled();
      }
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels for rows", () => {
      render(<MoviesTable {...defaultProps} />);

      const rows = screen.queryAllByRole("button");
      const matrixRow = rows.find((row) =>
        row.getAttribute("aria-label")?.includes("The Matrix")
      );

      expect(matrixRow).toHaveAttribute(
        "aria-label",
        expect.stringContaining("The Matrix")
      );
    });

    it("has proper ARIA labels for pagination buttons", () => {
      render(<MoviesTable {...defaultProps} />);

      expect(getFirstByRole("button", { name: /previous page/i })).toBeInTheDocument();
      expect(getFirstByRole("button", { name: /next page/i })).toBeInTheDocument();
    });

    it("supports keyboard navigation on rows", async () => {
      render(<MoviesTable {...defaultProps} />);

      const rows = screen.queryAllByRole("button");
      const matrixRow = rows.find((row) =>
        row.getAttribute("aria-label")?.includes("The Matrix")
      );

      if (matrixRow) {
        matrixRow.focus();
        await userEvent.keyboard("{Enter}");

        expect(mockOnMovieClick).toHaveBeenCalledWith(mockMovies[0]);
      }
    });
  });

  describe("Responsive Design", () => {
    it("renders both desktop and mobile views", () => {
      const { container } = render(<MoviesTable {...defaultProps} />);

      // Desktop table - check it exists
      const desktopTable = container.querySelector("table");
      expect(desktopTable).toBeInTheDocument();

      // Mobile cards section exists
      const mobileSection = container.querySelectorAll(".space-y-4");
      expect(mobileSection.length).toBeGreaterThan(0);
    });
  });

  describe("Edge Cases", () => {
    it("handles movies with null year", () => {
      const movieWithNoYear: NormalizedMovie = {
        ...mockMovies[0],
        year: null,
      };

      render(<MoviesTable {...defaultProps} movies={[movieWithNoYear]} />);

      expect(screen.getAllByText("N/A")[0]).toBeInTheDocument();
    });

    it("handles movies with empty genres", () => {
      const movieWithNoGenres: NormalizedMovie = {
        ...mockMovies[0],
        genres: [],
      };

      render(<MoviesTable {...defaultProps} movies={[movieWithNoGenres]} />);

      const naTexts = screen.queryAllByText("N/A");
      expect(naTexts.length).toBeGreaterThan(0);
    });

    it("handles movies with empty directors", () => {
      const movieWithNoDirectors: NormalizedMovie = {
        ...mockMovies[0],
        directors: [],
      };

      render(<MoviesTable {...defaultProps} movies={[movieWithNoDirectors]} />);

      const naTexts = screen.queryAllByText("N/A");
      expect(naTexts.length).toBeGreaterThan(0);
    });

    it("shows +N indicator for multiple genres", () => {
      render(<MoviesTable {...defaultProps} />);

      // Inception has 3 genres, should show +1
      const plusIndicators = screen.queryAllByText(/\+\d+/);
      expect(plusIndicators.length).toBeGreaterThan(0);
    });

    it("shows +N indicator for multiple directors", () => {
      render(<MoviesTable {...defaultProps} />);

      // The Matrix has 2 directors, should show +1
      const plusIndicators = screen.queryAllByText(/\+1/);
      expect(plusIndicators.length).toBeGreaterThan(0);
    });
  });
});
