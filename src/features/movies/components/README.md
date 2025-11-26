# Movies Components

React components for the Movies Explorer feature.

## Components

### Core Components
- **MoviesTable** - Main table/grid with pagination (consider TanStack Table)
- **MoviesFilters** - Filter panel with all filter inputs
- **MovieDetailsModal** - Modal/drawer showing full movie metadata
- **MovieCard** - Individual movie display (for mobile responsive view)

### Supporting Components
- **PaginationControls** - Next/prev buttons and page indicator
- **FilterInput** - Reusable filter input component
- **GenreMultiSelect** - Multi-select dropdown for genres
- **DirectorAutocomplete** - Autocomplete input for directors
- **LoadingSkeleton** - Loading state for table
- **EmptyState** - No results display

## Guidelines

- Keep components small and focused
- No business logic - use hooks and filters
- Responsive design (table → cards on mobile)
- Full accessibility:
  - Semantic HTML (table, thead, tbody)
  - ARIA attributes for modal (role="dialog", aria-modal)
  - Keyboard navigation (Tab, Enter, Escape)
  - Focus management (trap focus in modal)
- TanStack Table recommended for performance with large datasets
