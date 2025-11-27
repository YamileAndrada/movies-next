import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/core/providers";

export const metadata: Metadata = {
  title: "Movies Challenge - IUGO Labs",
  description:
    "Movie search and director analysis application. Built with Next.js 15, TypeScript, React Query, and TanStack Table.",
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
      <body className="antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
