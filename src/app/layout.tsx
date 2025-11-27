import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Movies Challenge - IUGO Labs",
  description:
    "Movie search and director analysis application. Built with Next.js 15, TypeScript, SWR, and TanStack Table.",
  keywords: [
    "movies",
    "directors",
    "search",
    "filter",
    "Next.js",
    "React",
    "TypeScript",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
