# Movies Feature

This feature implements the "Explore Movies" functionality.

## Purpose

Provides a searchable, filterable movie explorer with:
1. Paginated table/grid display
2. Multiple filter options (title, year range, genre, director)
3. Incremental loading by pages
4. Detailed movie view in modal/drawer

## Structure

- **components/** - UI components for movies table, filters, and details modal
- **hooks/** - Custom React hooks like `useMoviesSearch` and `usePaginatedMovies`
- **filters/** - Filter logic and utilities
- **tests/** - Unit and component tests for this feature

## Key Requirements

- Pagination or virtual scrolling support
- Filters: title (text), year range, genre (multi-select), director (autocomplete)
- Loading states with skeleton
- Error handling with user-friendly messages
- Modal/drawer with full movie metadata
- Accessibility (ARIA dialog, keyboard navigation, focus management)
