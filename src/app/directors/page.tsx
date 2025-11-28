import type { Metadata } from "next";
import { DirectorsThresholdForm } from "@/features/directors/components";

export const metadata: Metadata = {
  title: "Directors by Threshold | Movies Challenge",
  description:
    "Find directors who have directed more than a specified number of movies. Search and filter directors by their movie count.",
  keywords: [
    "directors",
    "movies",
    "film directors",
    "movie count",
    "director search",
  ],
  openGraph: {
    title: "Directors by Threshold",
    description:
      "Find directors who have directed more than a specified number of movies",
    type: "website",
  },
};

export default function DirectorsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <DirectorsThresholdForm />
      </div>
    </div>
  );
}
