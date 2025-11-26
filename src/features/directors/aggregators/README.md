# Directors Aggregators

Pure functions for director aggregation logic.

## Functions

### `aggregateDirectors(movies: Movie[], threshold: number): DirectorCount[]`

Pure function that:
1. Counts movies per director (case-insensitive, trimmed)
2. Filters directors with count strictly greater than threshold
3. Sorts results alphabetically by director name
4. Handles edge cases (null, undefined, empty strings)

**Type:**
```typescript
type DirectorCount = {
  name: string;
  count: number;
};
```

## Guidelines

- **Pure functions only** - no side effects
- Testable in isolation
- Handle all edge cases (duplicates, casing, null values)
- Well-typed with TypeScript
- Documented with JSDoc comments

## Testing Priority

This is the most critical code to test:
- Duplicate director names (different casing)
- Null/undefined/empty director values
- Multi-page movie inputs
- Threshold edge cases (0, negative, very high)
- Alphabetical sorting correctness
