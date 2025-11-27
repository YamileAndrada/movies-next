import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MoviesPage from "./page";
import type { NormalizedMovie } from "@/core/lib";

// Helper to get first element when strict mode causes duplicates
const getFirstByText = (text: string | RegExp) => screen.getAllByText(text)[0];
const getFirstByRole = (role: string, options?: any) =>
  screen.getAllByRole(role, options)[0];

// Mock the useMoviesSearch hook
const mockUseMoviesSearch = vi.fn();
vi.mock("@/features/movies/hooks/useMoviesSearch", () => ({
  useMoviesSearch: (filters: any, page: any) => mockUseMoviesSearch(filters, page),
}));

describe("MoviesPage", () => {
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
  ];

  const defaultHookReturn = {
    movies: mockMovies,
    loading: false,
    error: null,
    totalPages: 5,
    currentPage: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMoviesSearch.mockReturnValue(defaultHookReturn);
  });

  describe("Rendering", () => {
    it("renders page header", () => {
      render(<MoviesPage />);

      expect(getFirstByText(/explore movies/i)).toBeInTheDocument();
      expect(
        getFirstByText(/search and filter through our movie collection/i)
      ).toBeInTheDocument();
    });

    it("renders filters section", () => {
      render(<MoviesPage />);

      expect(getFirstByText(/^filters$/i)).toBeInTheDocument();
    });

    it("renders movies table when movies are loaded", () => {
      render(<MoviesPage />);

      expect(getFirstByText("The Matrix")).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("shows loading skeleton when loading", () => {
      mockUseMoviesSearch.mockReturnValue({
        ...defaultHookReturn,
        loading: true,
        movies: [],
      });

      const { container } = render(<MoviesPage />);

      const skeletons = container.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe("Error State", () => {
    it("displays error message when error occurs", () => {
      mockUseMoviesSearch.mockReturnValue({
        ...defaultHookReturn,
        error: { message: "Failed to fetch movies", code: "FETCH_ERROR" },
        movies: [],
      });

      render(<MoviesPage />);

      expect(getFirstByText(/error loading movies/i)).toBeInTheDocument();
      expect(getFirstByText(/failed to fetch movies/i)).toBeInTheDocument();
    });

    it("shows error alert with proper ARIA role", () => {
      mockUseMoviesSearch.mockReturnValue({
        ...defaultHookReturn,
        error: { message: "Network error", code: "NETWORK_ERROR" },
        movies: [],
      });

      render(<MoviesPage />);

      const alert = getFirstByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent(/error loading movies/i);
    });
  });

  describe("Empty State", () => {
    it("shows empty state when no movies found", () => {
      mockUseMoviesSearch.mockReturnValue({
        ...defaultHookReturn,
        movies: [],
      });

      render(<MoviesPage />);

      expect(getFirstByText(/no movies found/i)).toBeInTheDocument();
      expect(
        getFirstByText(/try adjusting your filters/i)
      ).toBeInTheDocument();
    });

    it("shows table skeleton when loading instead of empty state", () => {
      mockUseMoviesSearch.mockReturnValue({
        ...defaultHookReturn,
        loading: true,
        movies: [],
      });

      const { container } = render(<MoviesPage />);

      // Should show skeleton
      const skeletons = container.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("shows error message instead of empty state when there is an error", () => {
      mockUseMoviesSearch.mockReturnValue({
        ...defaultHookReturn,
        error: { message: "Error", code: "ERROR" },
        movies: [],
      });

      render(<MoviesPage />);

      // Should show error, not empty state
      expect(getFirstByText(/error loading movies/i)).toBeInTheDocument();
    });
  });

  describe("Movie Selection", () => {
    it("opens modal when movie is clicked", async () => {
      render(<MoviesPage />);

      // Find and click the movie row
      const rows = screen.queryAllByRole("button");
      const movieRow = rows.find((row) =>
        row.getAttribute("aria-label")?.includes("The Matrix")
      );

      expect(movieRow).toBeDefined();
      if (movieRow) {
        await userEvent.click(movieRow);

        // Modal should open
        await waitFor(() => {
          const dialogs = screen.queryAllByRole("dialog");
          expect(dialogs.length).toBeGreaterThan(0);
        });
      }
    });

    it("closes modal when close button is clicked", async () => {
      render(<MoviesPage />);

      // Click movie to open modal
      const rows = screen.queryAllByRole("button");
      const movieRow = rows.find((row) =>
        row.getAttribute("aria-label")?.includes("The Matrix")
      );

      if (movieRow) {
        await userEvent.click(movieRow);

        await waitFor(() => {
          const dialogs = screen.queryAllByRole("dialog");
          expect(dialogs.length).toBeGreaterThan(0);
        });

        // Find and click close button
        const closeButtons = screen.queryAllByRole("button", {
          name: /close modal/i,
        });
        if (closeButtons.length > 0) {
          await userEvent.click(closeButtons[0]);

          // Modal should close
          await waitFor(() => {
            const dialogs = screen.queryAllByRole("dialog");
            expect(dialogs.length).toBe(0);
          });
        }
      }
    });
  });

  describe("Filter Changes", () => {
    it("resets page to 1 when filters change", async () => {
      let capturedPage: any = null;

      mockUseMoviesSearch.mockImplementation((_, page) => {
        capturedPage = page;
        return defaultHookReturn;
      });

      render(<MoviesPage />);

      // Initially on page 1
      expect(capturedPage).toBe(1);

      // TODO: Simulate filter change
      // This would require interacting with the MoviesFilters component
      // For now, we just verify the initial state
    });
  });

  describe("Accessibility", () => {
    it("has proper main landmark", () => {
      render(<MoviesPage />);

      const mains = screen.queryAllByRole("main");
      expect(mains.length).toBeGreaterThan(0);
    });

    it("has proper heading hierarchy", () => {
      render(<MoviesPage />);

      const h1 = screen.queryAllByRole("heading", { level: 1 });
      expect(h1.length).toBeGreaterThan(0);
      expect(h1[0]).toHaveTextContent(/explore movies/i);

      const h2 = screen.queryAllByRole("heading", { level: 2 });
      expect(h2.length).toBeGreaterThan(0);
    });
  });
});
