# Directors Hooks

Custom React hooks for the Directors feature.

## Hooks

### `useDirectorsAggregation(threshold: number)`

Main hook for fetching and aggregating director data.

**Returns:**
```typescript
{
  directors: DirectorCount[];
  loading: boolean;
  error: Error | null;
}
```

**Responsibilities:**
- Fetches all movie pages from the API
- Calls director aggregation logic
- Handles loading and error states
- Cancels previous requests when threshold changes
- Memoizes results for stable references

## Guidelines

- Hooks should handle side effects only
- Business logic goes in aggregators or services
- Use proper dependency arrays for memoization
- Implement request cancellation with AbortController
