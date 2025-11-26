# Test Utilities

Shared testing utilities and setup files.

## Files

### `setup.ts`
Global test setup file that runs before all tests.
- Imports `@testing-library/jest-dom` for custom matchers
- Configures automatic cleanup after each test
- Mocks browser APIs (matchMedia, IntersectionObserver)

### `test-utils.tsx`
Custom render function and testing utilities.
- Wraps components with common providers
- Re-exports all Testing Library utilities
- Use this instead of importing directly from `@testing-library/react`

## Usage

### Import from test-utils
```typescript
// ✅ Good - use custom render
import { render, screen } from '@/test/test-utils';

// ❌ Bad - don't import directly
import { render, screen } from '@testing-library/react';
```

### Writing Tests
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Available Matchers

From `@testing-library/jest-dom`:
- `toBeInTheDocument()`
- `toBeVisible()`
- `toBeDisabled()`
- `toHaveTextContent()`
- `toHaveValue()`
- `toHaveAttribute()`
- And many more...

## Running Tests

```bash
npm run test              # Run all tests once
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Run tests with coverage report
npm run test:ui           # Open Vitest UI
```

## Best Practices

1. **Use semantic queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
2. **Test user behavior**: Test what users see and do, not implementation details
3. **Mock external dependencies**: Use `vi.mock()` for API calls, external modules
4. **Avoid testing implementation details**: Don't test state, internal functions
5. **Use user-event**: Prefer `userEvent` over `fireEvent` for better simulation
