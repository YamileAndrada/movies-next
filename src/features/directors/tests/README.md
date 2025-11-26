# Directors Tests

Tests for the Directors feature.

## Test Structure

### Unit Tests
- **aggregators/** - Test pure aggregation functions
- **hooks/** - Test custom hooks with React Testing Library

### Component Tests
- **components/** - Test UI components with user interactions

## Test Requirements

### Aggregator Tests (Priority: High)
- Duplicate handling (case-insensitive)
- Trimming whitespace
- Null/undefined/empty values
- Multi-page inputs
- Threshold filtering (strictly greater than)
- Alphabetical sorting

### Component Tests
- Loading state displays skeleton
- Error state displays message
- Empty state when no results
- Success state displays sorted list
- Input validation (non-numeric, negative)
- No API call on invalid input
- Accessibility (ARIA roles, labels, keyboard navigation)

## Running Tests

```bash
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```
