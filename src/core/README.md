# Core

Shared code used across multiple features.

## Structure

- **api/** - API layer with all HTTP requests to the movies endpoint
- **lib/** - Shared utilities, helpers, and mappers
- **ui/** - Shared/reusable UI components

## Principles

- **No feature-specific code** - Only shared, reusable code
- **Well-tested** - Core utilities must be thoroughly tested
- **Type-safe** - Strict TypeScript types
- **Documented** - Clear JSDoc comments for public APIs

## Guidelines

- Keep the API layer thin and focused
- Use DTOs/mappers to normalize API responses
- Create generic UI components that can be customized
- Avoid tight coupling between features
