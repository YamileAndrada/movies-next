# Movies Tests

Tests for the Movies Explorer feature.

## Test Structure

### Unit Tests
- **filters/** - Test filter functions
- **hooks/** - Test custom hooks

### Component Tests
- **components/** - Test UI components with user interactions

## Test Requirements

### Filter Tests
- Title filtering (case-insensitive, partial match)
- Year range filtering (inclusive, edge cases)
- Genre multi-select (ANY match, empty selection)
- Director filtering (exact match, case-insensitive)
- Extract unique values (genres, directors)

### Component Tests

#### MoviesTable
- Displays movies correctly
- Pagination works (next/prev buttons)
- Loading state shows skeleton
- Error state shows message
- Click on row opens modal

#### MoviesFilters
- All filter inputs render
- Filter changes trigger updates
- Debounced text input
- Multi-select works correctly
- Autocomplete suggestions appear

#### MovieDetailsModal
- Opens with correct data
- Displays all movie fields
- Closes on button click
- Closes on Escape key
- Focus trapped inside modal
- ARIA attributes correct (role="dialog", aria-modal="true")

### Integration Tests
- Apply filters → see filtered results
- Paginate through results
- Open modal → close → open another movie

## Running Tests

```bash
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```
