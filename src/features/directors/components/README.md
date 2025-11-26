# Directors Components

React components for the Directors by Threshold feature.

## Components

- **DirectorsThresholdForm** - Main form component with input, validation, and results display
- **DirectorsList** - Display component for the list of directors with counts
- **LoadingSkeleton** - Loading state placeholder
- **ErrorMessage** - Error state display
- **EmptyState** - Empty results display

## Guidelines

- Keep components focused on rendering only
- No business logic inside components
- Use hooks for state management and data fetching
- Ensure full accessibility (ARIA attributes, semantic HTML)
- Handle all UI states: loading, error, empty, success
