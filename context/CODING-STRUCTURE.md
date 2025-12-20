# URL Shortener - Frontend Coding Structure & Component Documentation

## Overview
This document provides comprehensive guidelines for the frontend codebase structure, component organization, usage patterns, and best practices for the URL Shortener application.

---

## Project Architecture

### Directory Structure
```
Frontend/
├── src/
│   ├── styles/
│   │   ├── globals.css              # Global theme variables and base styles
│   │   ├── components.css           # Component-specific styles (optional)
│   │   └── utilities.css            # Custom utility classes (optional)
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── layout/              # Page layout components
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── index.ts
│   │   │   ├── ui/                  # Reusable UI components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── ThemeToggle.tsx
│   │   │   │   └── index.ts
│   │   │   └── forms/               # Form components
│   │   │       ├── URLShortenerForm.tsx
│   │   │       └── index.ts
│   │   │
│   │   ├── landing/                 # Landing page sections
│   │   │   ├── Hero.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── Pricing.tsx
│   │   │   ├── CTA.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── shared/                  # Truly shared resources
│   │       └── icons/
│   │           └── index.ts
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useTheme.ts              # Theme management
│   │   └── useRuntimeConfig.ts      # Runtime configuration (existing)
│   │
│   ├── theme/                       # Theme configuration
│   │   └── index.ts                 # MUI theme setup
│   │
│   ├── App.tsx                      # Main application component
│   ├── main.tsx                     # Entry point
│   └── index.css                    # (Global import location)
│
├── package.json
├── vite.config.ts
├── tsconfig.json
└── public/
```

---

## Component Architecture & Patterns

### 1. **Common UI Components** (`components/common/ui/`)

Components in this folder are reusable, unstyled primitives that wrap Material-UI components with custom theming.

#### **Button.tsx**
- **Purpose**: Wrapper around MUI Button with custom styling via CSS variables
- **Props**:
  - `variant`: 'contained' | 'outlined' | 'text' (default: 'contained')
  - `size`: 'small' | 'medium' | 'large' (default: 'medium')
  - `fullWidth`: boolean (default: false)
  - All standard MUI Button props
- **Usage**:
  ```tsx
  <Button variant="contained" size="large" onClick={handleClick}>
    Click Me
  </Button>
  ```
- **MUI Reference**: Button supports `variant`, `color`, `size`, `disabled`, `href`, `loading` props
- **CSS Variables Used**: `--font-size-base`, `--font-weight-medium`, `--radius-md`, `--spacing-*`

#### **Input.tsx**
- **Purpose**: Wrapper around MUI TextField with consistent styling and validation
- **Props**:
  - `label`: string (optional)
  - `placeholder`: string (optional)
  - `error`: boolean (default: false)
  - `helperText`: string (optional)
  - `variant`: 'outlined' | 'filled' | 'standard' (default: 'outlined')
  - `fullWidth`: boolean (default: true)
  - All standard MUI TextField props
- **Usage**:
  ```tsx
  <Input
    label="Email"
    placeholder="Enter your email"
    error={hasError}
    helperText="Invalid email format"
  />
  ```
- **MUI Reference**: TextField uses FormControl internally, supports size, color, type, disabled props
- **CSS Variables Used**: `--bg-primary`, `--text-primary`, `--text-tertiary`, `--border-primary`

#### **Card.tsx**
- **Purpose**: Wrapper around MUI Card with hover effects and variants
- **Props**:
  - `variant`: 'outlined' | 'elevated' (default: 'elevated')
  - `hover`: boolean (default: true) - enables hover transform effect
  - All standard MUI Card props
- **Usage**:
  ```tsx
  <Card variant="outlined" hover={true}>
    <Box sx={{ p: 2 }}>Content</Box>
  </Card>
  ```
- **MUI Reference**: Card is a wrapper around Paper component
- **CSS Variables Used**: `--bg-primary`, `--border-primary`, `--shadow-md`, `--shadow-lg`

#### **ThemeToggle.tsx**
- **Purpose**: Theme switcher button with system preference detection
- **Props**: None (uses useTheme hook internally)
- **Features**:
  - Detects system color scheme preference
  - Persists user choice to localStorage
  - Toggles light/dark mode
- **Usage**:
  ```tsx
  <ThemeToggle />
  ```
- **Hook Dependency**: `useTheme()`

---

### 2. **Layout Components** (`components/common/layout/`)

Components that structure the overall page layout.

#### **Header.tsx**
- **Purpose**: Navigation bar with branding, menu, authentication, and theme toggle
- **Props**:
  - `onLogin`: () => void (callback for login action)
  - `onSignup`: () => void (callback for signup action)
  - `isAuthenticated`: boolean (default: false)
- **Features**:
  - Responsive mobile drawer navigation
  - Logo branding
  - Navigation links (Features, Pricing, About)
  - Auth buttons (Login/Sign Up)
  - Theme toggle integration
  - Mobile-friendly hamburger menu
- **Usage**:
  ```tsx
  <Header 
    onLogin={handleLogin} 
    onSignup={handleSignup}
    isAuthenticated={false}
  />
  ```
- **MUI Components Used**: AppBar, Toolbar, Drawer, IconButton, List, ListItem
- **CSS Variables Used**: `--bg-primary`, `--text-primary`, `--border-primary`

#### **Footer.tsx**
- **Purpose**: Page footer with company info, links, and legal
- **Features**:
  - Multi-column link sections (Product, Company, Support)
  - Newsletter signup placeholder
  - Social media links
  - Copyright notice
  - Responsive layout
- **Usage**:
  ```tsx
  <Footer />
  ```
- **MUI Components Used**: Container, Grid, Link, Typography

---

### 3. **Form Components** (`components/common/forms/`)

#### **URLShortenerForm.tsx**
- **Purpose**: Core form for shortening URLs with validation
- **Props**:
  - `onSubmit`: (url: string) => Promise<string> (async API call)
  - `loading`: boolean (external loading state)
  - `error`: string (external error message)
- **Features**:
  - URL validation using URL constructor
  - Error handling and display
  - Loading states with spinner
  - Result display with copy-to-clipboard
  - Responsive input layout
- **Usage**:
  ```tsx
  <URLShortenerForm 
    onSubmit={async (url) => {
      const response = await api.shorten(url);
      return response.shortUrl;
    }}
  />
  ```
- **Validation**: Checks for empty URL and valid URL format (http/https)
- **MUI Components Used**: Box, CircularProgress, Alert, Button, Input

---

### 4. **Landing Page Components** (`components/landing/`)

#### **Hero.tsx**
- **Purpose**: Homepage hero section with value proposition and URL shortener demo
- **Props**:
  - `onShortenUrl`: (url: string) => Promise<string> (optional)
  - `onSignup`: () => void (callback)
- **Features**:
  - Gradient background
  - Compelling headline and subheadline
  - Integrated URLShortenerForm
  - Primary and secondary CTA buttons
  - Decorative background circles
- **Usage**:
  ```tsx
  <Hero 
    onShortenUrl={handleShorten}
    onSignup={handleSignup}
  />
  ```

#### **Features.tsx**
- **Purpose**: Showcase key features in grid layout
- **Features Displayed**:
  - Custom Short URLs (with icon)
  - Real-time Analytics (with icon)
  - Enterprise Security (with icon)
- **Layout**: 3-column grid, responsive to 1-column on mobile
- **MUI Components Used**: Grid, Box, Typography, Card (custom)
- **Icons Used**: Material-UI icons (LinkIcon, AnalyticsIcon, SecurityIcon)

#### **Pricing.tsx**
- **Purpose**: Subscription pricing comparison with feature lists
- **Props**:
  - `onSelectPlan`: (plan: 'free' | 'paid') => void (callback)
- **Plans**:
  - Free: $0/forever, 5 URLs/week
  - Premium: $9.99/month, Unlimited URLs
- **Features**:
  - Side-by-side comparison cards
  - Feature lists with checkmarks
  - Highlight styling for recommended plan
  - Responsive design
- **MUI Components Used**: Card, List, ListItem, ListItemIcon, Button

#### **CTA.tsx**
- **Purpose**: Secondary call-to-action section
- **Props**:
  - `onGetStarted`: () => void (callback)
- **Features**:
  - Gradient background matching hero
  - Prominent headline
  - Dual CTA buttons (signup & contact)
  - Trust-building copy
- **MUI Components Used**: Box, Container, Typography, Button

---

## Styling System

### Global CSS Variables (`src/styles/globals.css`)

All theme values are defined as CSS custom properties for dynamic theming support.

#### Color Palette
```css
/* Root (Light Mode) */
--color-primary: #1976d2
--color-secondary: #dc004e
--color-success: #4caf50
--color-warning: #ff9800
--color-error: #f44336
--color-info: #2196f3

/* Dark Mode Overrides */
[data-theme="dark"] {
  --color-primary: #90caf9
  --color-secondary: #f48fb1
  /* ... */
}
```

#### Spacing Scale
```css
--spacing-xs: 0.25rem   (4px)
--spacing-sm: 0.5rem    (8px)
--spacing-md: 1rem      (16px)
--spacing-lg: 1.5rem    (24px)
--spacing-xl: 2rem      (32px)
--spacing-2xl: 3rem     (48px)
--spacing-3xl: 4rem     (64px)
```

#### Typography
```css
--font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto'
--font-family-mono: 'JetBrains Mono', 'Fira Code'
--font-size-xs: 0.75rem   (12px)
--font-size-sm: 0.875rem  (14px)
--font-size-base: 1rem    (16px)
--font-weight-normal: 400
--font-weight-medium: 500
--font-weight-bold: 700
```

#### Using Variables in Components
```tsx
// Via SX Prop
<Box sx={{
  color: 'var(--text-primary)',
  backgroundColor: 'var(--bg-primary)',
  padding: 'var(--spacing-md)',
}}/>

// Direct CSS
.my-class {
  color: var(--text-primary);
  border-radius: var(--radius-md);
}
```

---

## Theme Management

### useTheme Hook (`src/hooks/useTheme.ts`)
Custom hook for managing dark/light mode.

```tsx
const { theme, toggleTheme, setTheme } = useTheme();

// theme: 'light' | 'dark'
// toggleTheme(): void - switches between modes
// setTheme(mode): void - sets specific mode
```

**Features**:
- System preference detection (`prefers-color-scheme`)
- LocalStorage persistence
- Sets `data-theme` attribute on document root

### Theme Configuration (`src/theme/index.ts`)
MUI theme creation with CSS variables integration.

```tsx
const theme = createAppTheme('light' | 'dark');

// Returns MUI Theme object with:
// - Palette configuration (primary, secondary, etc.)
// - Typography settings
// - Component overrides
// - Shape (borderRadius)
```

---

## MUI Component Usage Guidelines

### Button Component (via custom Button.tsx)
**MUI Props Available**:
- `variant`: 'text' | 'outlined' | 'contained'
- `size`: 'small' | 'medium' | 'large'
- `color`: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
- `disabled`: boolean
- `fullWidth`: boolean
- `href`: string (for link buttons)
- `loading`: boolean (new in MUI v6)

**Best Practices**:
- Use `variant="contained"` for primary actions
- Use `variant="outlined"` for secondary actions
- Use `variant="text"` for tertiary actions
- Always provide meaningful `aria-label` for icon buttons
- Use `loading` prop with `loadingIndicator` for async operations

### TextField Component (via custom Input.tsx)
**MUI Props Available**:
- `variant`: 'outlined' | 'filled' | 'standard'
- `size`: 'small' | 'medium'
- `color`: 'primary' | 'secondary' | etc.
- `error`: boolean
- `helperText`: string
- `disabled`: boolean
- `fullWidth`: boolean
- `multiline`: boolean
- `rows`: number | string
- `maxRows`: number | string

**Best Practices**:
- Use `error` + `helperText` for validation feedback
- Set `fullWidth` for form fields in containers
- Use `placeholder` as hint, not substitute for label
- Use `type="password"` for sensitive input
- Implement debouncing for async validation

### Card Component (via custom Card.tsx)
**MUI Props Available**:
- `variant`: 'outlined' | 'elevation'
- `raised`: boolean (slight elevation increase)
- `sx`: system prop for custom styles

**Best Practices**:
- Use for grouping related content
- Combine with CardContent, CardActions, CardHeader
- Use `variant="outlined"` for lighter cards
- Apply hover effects for interactive cards

### AppBar Component
**MUI Props Available**:
- `position`: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky'
- `color`: 'default' | 'primary' | 'secondary' | 'transparent'
- `elevation`: number (0-24)
- `enableColorOnDark`: boolean

**Usage Pattern**:
```tsx
<AppBar position="sticky">
  <Toolbar>
    {/* Content */}
  </Toolbar>
</AppBar>
```

---

## Data Flow & State Management

### Component Props Flow
```
App (Entry Point)
├── Header (receives onLogin, onSignup)
├── Main Content
│   ├── Hero (receives onShortenUrl, onSignup)
│   ├── Features (static)
│   ├── Pricing (receives onSelectPlan)
│   └── CTA (receives onGetStarted)
└── Footer (static)
```

### Theme State Management
```
App
├── useTheme() hook
├── Sets data-theme on document root
├── All components read from data-theme via CSS variables
└── Theme toggle updates localStorage
```

### Form State Management
```
URLShortenerForm
├── Local state: url (input value)
├── Local state: result (shortened URL)
├── Local state: isLoading (submission state)
├── Local state: isError (validation state)
└── Parent Props: onSubmit callback
```

---

## Responsive Design

### Breakpoints (from MUI theme)
```
xs: 0px       (phones)
sm: 600px     (tablets)
md: 900px     (small laptops)
lg: 1200px    (desktops)
xl: 1536px    (large screens)
```

### Usage in SX Prop
```tsx
<Box sx={{
  display: { xs: 'none', md: 'flex' },           // Hide on mobile, show on desktop
  flexDirection: { xs: 'column', md: 'row' },    // Stack vertically, then horizontally
  gap: { xs: '8px', md: '16px' },                // Responsive spacing
  fontSize: { xs: '12px', md: '16px' },          // Responsive font size
}}/>
```

### Container Queries
```tsx
<Container maxWidth="lg">
  {/* Content auto-centers and constrains width */}
</Container>
```

---

## Accessibility Standards

### ARIA Attributes
```tsx
// Buttons
<Button aria-label="Close menu">
  <CloseIcon />
</Button>

// Links
<Link aria-current="page">Current Page</Link>

// Form inputs
<Input aria-invalid={hasError} aria-describedby="error-msg" />
```

### Focus Management
- All interactive elements must be keyboard accessible
- Focus indicators visible via `outline: 2px solid var(--border-focus)`
- Tab order should follow visual order

### Semantic HTML
- Use `<main>` for page content
- Use `<header>`, `<footer>`, `<nav>`
- Use `<section>` for major content groups
- Avoid divs when semantic elements apply

### Color Contrast
- Text: minimum 4.5:1 contrast ratio
- Large text: minimum 3:1 contrast ratio
- UI components: minimum 3:1 ratio for boundaries
- All verified in both light and dark modes

---

## Best Practices

### Component Organization
1. **Single Responsibility**: Each component should handle one concern
2. **Composition Over Inheritance**: Use React composition pattern
3. **Props Interface**: Define clear, typed props interfaces
4. **Default Props**: Provide sensible defaults for all optional props

### Styling
1. **Use CSS Variables**: Never hardcode colors or spacing
2. **Responsive First**: Design mobile-first, enhance for larger screens
3. **Avoid Inline Styles**: Use SX prop or CSS classes
4. **Theme-Aware**: Components should adapt to light/dark mode

### Performance
1. **Lazy Load**: Load large features on-demand
2. **Memoization**: Use React.memo for expensive renders
3. **Code Splitting**: Separate landing page from dashboard code
4. **Tree Shaking**: Import only used MUI components

### Type Safety
1. **TypeScript**: All components should be fully typed
2. **Interfaces**: Create interfaces for all props
3. **Generics**: Use for reusable component patterns
4. **Strict Mode**: Enable TypeScript strict mode

---

## Testing Guidelines

### Unit Tests
- Test component rendering
- Test prop variations
- Test callback functions
- Test form validation

### Integration Tests
- Test component interactions
- Test navigation flows
- Test theme switching
- Test responsive behavior

### Accessibility Tests
- Test keyboard navigation
- Test screen reader compatibility
- Test color contrast
- Test focus visibility

---

## Common Patterns

### Controlled Input Pattern
```tsx
const [value, setValue] = useState('');

<Input
  value={value}
  onChange={(e) => setValue(e.target.value)}
  placeholder="Enter value"
/>
```

### Conditional Rendering
```tsx
{isLoading ? (
  <CircularProgress />
) : isError ? (
  <Alert severity="error">{error}</Alert>
) : (
  <Box>Content</Box>
)}
```

### Click-Away Handler
```tsx
import { ClickAwayListener } from '@mui/material';

<ClickAwayListener onClickAway={handleClose}>
  <Drawer open={open}>...</Drawer>
</ClickAwayListener>
```

### Theme-Based Styling
```tsx
<Box sx={(theme) => ({
  color: theme.palette.mode === 'dark' ? '#fff' : '#000',
})}/>

// Or with CSS variables
<Box sx={{
  color: 'var(--text-primary)',
}}/>
```

---

## File Naming Conventions

- **Components**: PascalCase (e.g., `Header.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useTheme.ts`)
- **Styles**: lowercase with extension (e.g., `globals.css`)
- **Types/Interfaces**: PascalCase (e.g., `ButtonProps`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_URL_LENGTH`)

---

## Environment Variables

```bash
# Example .env files structure
VITE_API_BASE_URL=http://localhost:8000
VITE_FIREBASE_CONFIG=...
```

Usage in code:
```tsx
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

---

## Deployment Checklist

- [ ] Remove console.log statements
- [ ] Test dark/light mode thoroughly
- [ ] Verify responsive design on all breakpoints
- [ ] Run accessibility audit
- [ ] Optimize bundle size
- [ ] Test form validation and error handling
- [ ] Verify all links work correctly
- [ ] Test on target browsers
- [ ] Performance audit (Lighthouse)

---

## Resources & Documentation

- [Material-UI v6 Documentation](https://mui.com/material-ui/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [Web Content Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## Additional References

See also:
- `frontend-design-language.md` - Design language and theming system
- `project.md` - Project business requirements
- `dbcontext.md` - Database schema and data models

---

**Last Updated**: December 20, 2025  
**Version**: 1.0  
**Status**: Complete & Ready for Development
