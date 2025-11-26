# Core UI Components

Shared, reusable UI components used across features.

## Purpose

Generic, presentational components that can be used in multiple features.

## Suggested Components

### Form Components
- **Button** - Customizable button with variants (primary, secondary, danger)
- **Input** - Text input with label, error message, and validation
- **Select** - Dropdown select with options
- **MultiSelect** - Multi-select dropdown
- **Autocomplete** - Autocomplete input with suggestions

### Feedback Components
- **LoadingSkeleton** - Generic loading placeholder
- **Spinner** - Loading spinner
- **ErrorMessage** - Error display component
- **Toast** - Notification toast (optional)

### Layout Components
- **Modal** - Accessible modal/dialog
- **Drawer** - Side drawer panel
- **Card** - Content card wrapper

### Data Display
- **Table** - Basic table wrapper (or integrate TanStack Table)
- **Pagination** - Pagination controls
- **EmptyState** - No data placeholder

## Guidelines

### Accessibility First
- Semantic HTML
- ARIA attributes
- Keyboard navigation
- Focus management
- Screen reader support

### Customization
- Props for variants/sizes
- Composable components
- Styled with Tailwind CSS
- Support for custom className

### Type Safety
```typescript
type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
};
```

### Testing
- Component tests with Testing Library
- Accessibility tests with axe
- User interaction tests
- Keyboard navigation tests

## Example Usage

```tsx
import { Button, Input, Modal } from '@/core/ui';

<Input
  label="Threshold"
  type="number"
  value={threshold}
  onChange={setThreshold}
  error={error}
  required
/>

<Button variant="primary" onClick={handleSubmit}>
  Calculate
</Button>

<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Movie Details"
>
  {content}
</Modal>
```

## Naming Convention

- PascalCase for component names
- Descriptive prop names
- Prefix boolean props with `is` or `has`
- Event handlers prefixed with `on`
