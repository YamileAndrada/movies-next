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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <DirectorsThresholdForm />
      </div>
    </div>
  );
}
