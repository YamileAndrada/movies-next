import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@/test/test-utils";
import Home from "./page";

describe("Home Page", () => {
  afterEach(() => {
    cleanup();
  });

  it("should render the page title", () => {
    render(<Home />);
    expect(screen.getByText("Movies Explorer")).toBeDefined();
  });

  it("should render navigation links", () => {
    render(<Home />);

    const directorsLink = screen.getByRole("link", {
      name: /directors analysis/i,
    }) as HTMLAnchorElement;
    const moviesLink = screen.getByRole("link", {
      name: /explore movies/i,
    }) as HTMLAnchorElement;

    expect(directorsLink).toBeDefined();
    expect(directorsLink.href).toContain("/directors");

    expect(moviesLink).toBeDefined();
    expect(moviesLink.href).toContain("/movies");
  });
});
