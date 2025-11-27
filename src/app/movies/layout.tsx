import type { Metadata } from "next";

/**
 * Metadata for Movies page
 */
export const metadata: Metadata = {
  title: "Explore Movies | Movies Next",
  description:
    "Search and filter through our extensive movie collection. Find movies by title, year, genre, and director.",
  keywords: [
    "movies",
    "film search",
    "movie database",
    "movie explorer",
    "film filter",
  ],
  openGraph: {
    title: "Explore Movies",
    description: "Search and filter through our extensive movie collection",
    type: "website",
  },
};

/**
 * Layout for Movies page
 */
export default function MoviesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
