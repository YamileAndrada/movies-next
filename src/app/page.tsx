import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-8">Movies Challenge</h1>
      <div className="flex gap-4">
        <Link
          href="/directors"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Directors by Threshold
        </Link>
        <Link
          href="/movies"
          className="px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Explore Movies
        </Link>
      </div>
    </main>
  );
}
