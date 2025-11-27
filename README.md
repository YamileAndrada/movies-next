# Movies Challenge - IUGO Labs

Movie search and director analysis application built with Next.js 15, TypeScript, and TanStack Table.

**Test Coverage: 256/256 (100%)** | **TypeScript Strict Mode** | **Fully Accessible**

## Features

### 🎬 Directors by Threshold
- Input a threshold value (integer ≥ 0)
- Fetches all movie pages from the API
- Aggregates movie count per director
- Filters directors with count strictly above threshold
- Displays results alphabetically sorted with movie count
- Full accessibility support (ARIA labels, keyboard navigation)

### 🎞️ Movies Explorer
- Paginated table/grid view of movies
- Advanced filtering:
  - Title search (text)
  - Year range
  - Genre (multi-select)
  - Director (autocomplete)
- Incremental loading by pages
- Movie details in modal/drawer
- Responsive design (mobile, tablet, desktop)

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Data Fetching**: SWR - caching, deduplication, background refetch
- **Tables**: TanStack Table v8
- **Styling**: Tailwind CSS
- **Testing**: Vitest + Testing Library (256 unit tests) + Playwright (E2E)

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── features/         # Feature-based modules (directors, movies)
├── core/            # Shared API, utilities, UI components
└── test/            # Test utilities
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn or pnpm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd movies-next

# Install dependencies
npm install

# Configure environment variables (optional)
cp .env.example .env.local
# Edit .env.local to customize API endpoint if needed

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Environment Variables

The application uses the following environment variables:

- `NEXT_PUBLIC_API_BASE_URL`: Base URL for the movies API endpoint (default: `https://challenge.iugolabs.com/api/movies/search`)

Create a `.env.local` file in the root directory to override the default values:

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=https://challenge.iugolabs.com/api/movies/search
```

**Note**: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. The API layer will use the hardcoded fallback if the environment variable is not set.

## Available Scripts

### Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
```

### Code Quality

```bash
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run format:check # Check formatting
npm run typecheck    # TypeScript type checking
```

### Testing

```bash
# Unit & Component Tests
npm run test              # Run all tests
npm run test:watch        # Run tests in watch mode
npm run test:ui           # Open Vitest UI
npm run test:coverage     # Run tests with coverage

# E2E Tests
npm run test:e2e          # Run Playwright E2E tests
npm run test:e2e:ui       # Open Playwright UI
npm run test:e2e:headed   # Run E2E tests in headed mode
npm run test:e2e:debug    # Debug E2E tests
```

## API

Endpoint: `GET https://challenge.iugolabs.com/api/movies/search?page=<page>`

Configure via `NEXT_PUBLIC_API_BASE_URL` environment variable.

## Key Features

- ✅ Feature-based architecture with separation of concerns
- ✅ Client-side filtering and pagination for optimal UX
- ✅ Request deduplication and caching with SWR
- ✅ Fully accessible (ARIA, keyboard navigation, screen reader support)
- ✅ Comprehensive test coverage (256 tests)
- ✅ TypeScript strict mode
- ✅ Responsive design

## License

ISC

---

🤖 **Built with Claude Code**
