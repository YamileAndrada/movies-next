# E2E Tests

End-to-end tests using Playwright and axe-core for accessibility testing.

## Test Suites

### 1. Directors Flow (`directors.spec.ts`)
Tests the complete directors by threshold workflow:
- ✅ Input threshold → Calculate → View results
- ✅ Validation error for non-numeric input
- ✅ Empty state for negative threshold

### 2. Movies Explorer Flow (`movies.spec.ts`)
Tests the complete movies exploration workflow:
- ✅ Apply filters → Navigate pages → View details
- ✅ Pagination navigation between pages
- ✅ Multiple filter criteria

### 3. Accessibility (`accessibility.spec.ts`)
Tests accessibility compliance using axe-core:
- ✅ No accessibility violations on all pages
- ✅ Proper ARIA labels on interactive elements
- ✅ Keyboard navigation support

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Open Playwright UI (recommended for development)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug
```

## Test Configuration

Configuration is in `playwright.config.ts`:
- Tests run in Chromium browser
- Automatic dev server startup
- Screenshots on failure
- Trace on first retry
