# Movies Challenge

A Next.js 15 application for movie search and director analysis. This app fetches movie data from a single API endpoint and provides director aggregation by movie count threshold and a comprehensive movie explorer with filtering capabilities.

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

- **Framework**: Next.js 15.5.6
- **Language**: TypeScript 5.9 (strict mode)
- **Styling**: Tailwind CSS v4
- **Testing**: Vitest + Testing Library
- **Linting**: ESLint + Prettier
- **State Management**: React hooks
- **HTTP Client**: Native Fetch API

## Project Structure

```
movies-next/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── directors/          # Directors threshold page
│   │   ├── movies/             # Movies explorer page
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   ├── features/               # Feature-based architecture
│   │   ├── directors/          # Directors feature
│   │   │   ├── components/     # UI components
│   │   │   ├── hooks/          # Custom hooks
│   │   │   ├── aggregators/    # Pure functions for aggregation
│   │   │   └── tests/          # Feature tests
│   │   └── movies/             # Movies feature
│   │       ├── components/     # UI components
│   │       ├── hooks/          # Custom hooks
│   │       ├── filters/        # Filter utilities
│   │       └── tests/          # Feature tests
│   ├── core/                   # Shared core modules
│   │   ├── api/                # API layer (moviesApi.ts)
│   │   ├── lib/                # Utilities and helpers
│   │   └── ui/                 # Shared UI components
│   └── test/                   # Test utilities and setup
├── CLAUDE.md                   # AI assistant guidelines
├── PROMPTS.md                  # Development prompts
├── ADR.md                      # Architecture decisions
└── requirements.md             # Project requirements
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

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

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
npm run test              # Run all tests
npm run test:watch        # Run tests in watch mode
npm run test:ui           # Open Vitest UI
npm run test:coverage     # Run tests with coverage
```

## API Integration

The application consumes a single backend endpoint:

```
GET https://challenge.iugolabs.com/api/movies/search?page=<page>
```

**Response structure:**
```json
{
  "page": 1,
  "per_page": 10,
  "total": 100,
  "total_pages": 10,
  "data": [
    {
      "Title": "The Matrix",
      "Year": "1999",
      "Rated": "R",
      "Released": "31 Mar 1999",
      "Runtime": "136 min",
      "Genre": "Action, Sci-Fi",
      "Director": "Lana Wachowski, Lilly Wachowski",
      "Writer": "Lilly Wachowski, Lana Wachowski",
      "Actors": "Keanu Reeves, Laurence Fishburne"
    }
  ]
}
```

**Critical Constraint:** No director-specific endpoint exists. All director aggregation must be done client-side by fetching and processing all movie pages.

## Architecture Principles

### Feature-Based Organization
- Code organized by feature (`/features/directors`, `/features/movies`)
- Each feature is self-contained with its own components, hooks, and tests
- Shared code lives in `/core`

### Separation of Concerns
- **Components**: Rendering only, no business logic
- **Hooks**: Side effects and state management
- **Aggregators/Filters**: Pure functions for data transformation
- **API Layer**: Centralized HTTP requests

### API Layer
- All API calls go through `/core/api/moviesApi.ts`
- Request cancellation with AbortController
- Request deduplication to prevent redundant calls
- Typed errors (NetworkError, ValidationError, AbortError)
- Comprehensive test coverage

### Performance
- Request deduplication
- Memoization of expensive computations
- Request cancellation on filter/threshold changes
- Code-splitting by feature
- Virtualized lists for large datasets (optional: TanStack Table)

### Error Handling
- Error boundaries per feature
- User-friendly error messages
- Graceful degradation on network/parsing failures

### Testing Strategy
- **Unit Tests**: Pure functions (aggregators, filters, utilities)
- **Component Tests**: UI components with user interactions
- **Integration Tests**: Feature flows
- Coverage thresholds: 80% lines, functions, branches, statements

## Development Guidelines

### TypeScript
- Use strict mode
- Avoid `any` type
- Define interfaces for all data structures
- Use type inference when possible

### Components
- Keep components small and focused
- Use semantic HTML
- Implement proper ARIA attributes
- Support keyboard navigation

### Hooks
- Handle loading/error/empty states
- Implement request cancellation
- Memoize values and callbacks
- Use stable dependencies

### Testing
- Test user behavior, not implementation
- Use semantic queries (getByRole, getByLabelText)
- Test all states (loading, error, empty, success)
- Verify accessibility

### Commits
- Use Conventional Commits format
- Write clear, descriptive messages
- Include emoji when appropriate: 🤖 Generated with Claude Code

## Accessibility

- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- Color contrast (WCAG AA minimum)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Targets

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse Score: > 90

## Contributing

1. Create a feature branch
2. Make your changes
3. Add tests
4. Run `npm run typecheck && npm run lint && npm run test`
5. Commit with conventional commits
6. Create a pull request

## Documentation

- [CLAUDE.md](CLAUDE.md) - AI assistant guidelines
- [PROMPTS.md](PROMPTS.md) - Development prompts for each phase
- [ADR.md](ADR.md) - Architecture decision records
- [requirements.md](requirements.md) - Detailed project requirements
- [src/core/api/README.md](src/core/api/README.md) - API layer documentation

## License

ISC

---

🤖 **Built with Claude Code**
