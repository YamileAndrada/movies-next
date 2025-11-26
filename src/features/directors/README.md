# Directors Feature

This feature implements the "Directors by Threshold" functionality.

## Purpose

Allows users to search for directors who have directed more than a specified number of movies by:
1. Accepting a threshold input (integer ≥ 0)
2. Fetching all movie pages from the API
3. Aggregating movies by director
4. Filtering directors with movie count strictly above the threshold
5. Displaying results alphabetically sorted

## Structure

- **components/** - UI components for the directors threshold form and results display
- **hooks/** - Custom React hooks like `useDirectorsAggregation`
- **aggregators/** - Pure functions for director aggregation logic
- **tests/** - Unit and component tests for this feature

## Key Requirements

- Input validation (non-numeric shows error, negative shows empty result)
- Loading, error, empty, and success UI states
- Full accessibility support (ARIA labels, keyboard navigation)
- Request cancellation when threshold changes
