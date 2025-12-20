# Frontend Design Language Context

## Overview
This document outlines the frontend design language for the URL Shortener application, incorporating Material-UI (MUI) as the primary component library, Tailwind CSS for utility-first styling, and comprehensive theming strategies.

## ⚠️ CRITICAL DESIGN RESTRICTIONS

### PROHIBITED ELEMENTS
The following design elements are **STRICTLY FORBIDDEN** in this project:

#### ❌ **NEVER USE GRADIENTS**
- No CSS gradients (`linear-gradient`, `radial-gradient`, `conic-gradient`)
- No background gradients on any components
- No text gradients or gradient overlays
- Use solid colors only from the defined color palette

#### ❌ **NEVER USE UNICODE ICONS OR EMOJIS**
- No emoji characters (🚀, ⭐, 🔥, ⚡, 💡, etc.)
- No Unicode symbols as icons
- No emoji-based visual elements
- Use only Material-UI icons (`@mui/icons-material`) or approved icon libraries
- For decorative elements, use CSS shapes, borders, or approved SVG icons

#### ✅ **APPROVED ALTERNATIVES**
- **For backgrounds**: Use solid colors from `--bg-primary`, `--bg-secondary`, `--bg-tertiary`
- **For icons**: Use Material-UI icons like `CheckCircleIcon`, `StarIcon`, `ArrowForwardIcon`
- **For emphasis**: Use color, typography, spacing, and shadows from the design system
- **For visual hierarchy**: Use size, weight, and positioning instead of gradients

## Design System Architecture

### Core Technologies
- **Material-UI (MUI)**: React component library implementing Google's Material Design
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Emotion**: CSS-in-JS library for styled components (used by MUI)
- **CSS Variables**: For dynamic theming and runtime theme switching

## Global CSS Rules

### Global CSS Variables for Theme Management

#### 1. Root CSS Variables Setup
Create a global CSS file (`src/index.css` or `src/styles/globals.css`) with comprehensive theme variables:

```css
:root {
  /* Color Palette */
  --color-primary: #1976d2;
  --color-primary-light: #42a5f5;
  --color-primary-dark: #1565c0;
  --color-secondary: #dc004e;
  --color-secondary-light: #ff5983;
  --color-secondary-dark: #9a0036;

  /* Neutral Colors */
  --color-white: #ffffff;
  --color-black: #000000;
  --color-gray-50: #fafafa;
  --color-gray-100: #f5f5f5;
  --color-gray-200: #eeeeee;
  --color-gray-300: #e0e0e0;
  --color-gray-400: #bdbdbd;
  --color-gray-500: #9e9e9e;
  --color-gray-600: #757575;
  --color-gray-700: #616161;
  --color-gray-800: #424242;
  --color-gray-900: #212121;

  /* Semantic Colors */
  --color-success: #4caf50;
  --color-warning: #ff9800;
  --color-error: #f44336;
  --color-info: #2196f3;

  /* Background Colors */
  --bg-primary: var(--color-white);
  --bg-secondary: var(--color-gray-50);
  --bg-tertiary: var(--color-gray-100);

  /* Text Colors */
  --text-primary: var(--color-gray-900);
  --text-secondary: var(--color-gray-700);
  --text-tertiary: var(--color-gray-500);
  --text-inverse: var(--color-white);

  /* Border Colors */
  --border-primary: var(--color-gray-300);
  --border-secondary: var(--color-gray-200);
  --border-focus: var(--color-primary);

  /* Spacing Scale */
  --spacing-xs: 0.25rem;    /* 4px */
  --spacing-sm: 0.5rem;     /* 8px */
  --spacing-md: 1rem;       /* 16px */
  --spacing-lg: 1.5rem;     /* 24px */
  --spacing-xl: 2rem;       /* 32px */
  --spacing-2xl: 3rem;      /* 48px */
  --spacing-3xl: 4rem;      /* 64px */

  /* Border Radius */
  --radius-sm: 0.25rem;     /* 4px */
  --radius-md: 0.5rem;      /* 8px */
  --radius-lg: 0.75rem;     /* 12px */
  --radius-xl: 1rem;        /* 16px */
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

  /* Typography */
  --font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  --font-family-mono: 'JetBrains Mono', 'Fira Code', monospace;

  --font-size-xs: 0.75rem;   /* 12px */
  --font-size-sm: 0.875rem;  /* 14px */
  --font-size-base: 1rem;    /* 16px */
  --font-size-lg: 1.125rem;  /* 18px */
  --font-size-xl: 1.25rem;   /* 20px */
  --font-size-2xl: 1.5rem;   /* 24px */
  --font-size-3xl: 1.875rem; /* 30px */
  --font-size-4xl: 2.25rem;  /* 36px */

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;

  /* Transitions */
  --transition-fast: 150ms ease-in-out;
  --transition-normal: 250ms ease-in-out;
  --transition-slow: 350ms ease-in-out;

  /* Z-Index Scale */
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
}
```

#### 2. Dark Mode Variables
```css
[data-theme="dark"] {
  /* Color Palette - Dark Mode */
  --color-primary: #90caf9;
  --color-primary-light: #e3f2fd;
  --color-primary-dark: #42a5f5;
  --color-secondary: #f48fb1;
  --color-secondary-light: #fce4ec;
  --color-secondary-dark: #ad1457;

  /* Neutral Colors - Dark Mode */
  --color-gray-50: #121212;
  --color-gray-100: #1e1e1e;
  --color-gray-200: #2a2a2a;
  --color-gray-300: #3a3a3a;
  --color-gray-400: #5a5a5a;
  --color-gray-500: #7a7a7a;
  --color-gray-600: #9a9a9a;
  --color-gray-700: #bababa;
  --color-gray-800: #dadada;
  --color-gray-900: #f5f5f5;

  /* Background Colors - Dark Mode */
  --bg-primary: var(--color-gray-900);
  --bg-secondary: var(--color-gray-800);
  --bg-tertiary: var(--color-gray-700);

  /* Text Colors - Dark Mode */
  --text-primary: var(--color-gray-50);
  --text-secondary: var(--color-gray-200);
  --text-tertiary: var(--color-gray-400);
  --text-inverse: var(--color-gray-900);

  /* Border Colors - Dark Mode */
  --border-primary: var(--color-gray-700);
  --border-secondary: var(--color-gray-600);
  --border-focus: var(--color-primary);
}
```

#### 3. Light Mode Variables (Default)
```css
[data-theme="light"] {
  /* Light mode is the default, so we just ensure proper fallback */
  color-scheme: light;
}

[data-theme="dark"] {
  color-scheme: dark;
}
```

### Global CSS Rules Implementation

#### 1. Base Styles
```css
/* src/styles/globals.css */
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  color: var(--text-primary);
  background-color: var(--bg-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color var(--transition-normal), color var(--transition-normal);
}
```

#### 2. Theme Toggle Implementation
```javascript
// src/hooks/useTheme.js
import { useState, useEffect } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first, then system preference
    const saved = localStorage.getItem('theme');
    if (saved) return saved;

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return { theme, toggleTheme };
}
```

#### 3. Theme Provider Component
```jsx
// src/components/ThemeProvider.jsx
import { useTheme } from '../hooks/useTheme';

export function ThemeProvider({ children }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ minHeight: '100vh' }}>
      {children}
    </div>
  );
}

// Make toggleTheme available globally
export { useTheme };
```

#### 4. Theme Toggle Button
```jsx
// src/components/ThemeToggle.jsx
import { useTheme } from '../hooks/useTheme';
import { IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <IconButton onClick={toggleTheme} color="inherit">
      {theme === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  );
}
```

### Integration with Material-UI

#### 1. MUI Theme with CSS Variables
```jsx
// src/theme/index.js
import { createTheme } from '@mui/material/styles';

export const createAppTheme = (mode) => createTheme({
  cssVariables: true,
  palette: {
    mode,
    primary: {
      main: 'var(--color-primary)',
    },
    secondary: {
      main: 'var(--color-secondary)',
    },
    background: {
      default: 'var(--bg-primary)',
      paper: 'var(--bg-secondary)',
    },
    text: {
      primary: 'var(--text-primary)',
      secondary: 'var(--text-secondary)',
    },
  },
  typography: {
    fontFamily: 'var(--font-family-primary)',
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
        },
      },
    },
  },
});
```

#### 2. App Root with Theme Integration
```jsx
// src/App.jsx
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ThemeProvider } from './components/ThemeProvider';
import { createAppTheme } from './theme';
import { useTheme } from './hooks/useTheme';
import CssBaseline from '@mui/material/CssBaseline';

function AppContent() {
  const { theme: mode } = useTheme();
  const muiTheme = createAppTheme(mode);

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {/* Your app content */}
    </MuiThemeProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
```

### Integration with Tailwind CSS

#### 1. Tailwind Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class', // or 'media' for system preference
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        background: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          tertiary: 'var(--bg-tertiary)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
        },
        border: {
          primary: 'var(--border-primary)',
          secondary: 'var(--border-secondary)',
          focus: 'var(--border-focus)',
        },
      },
      spacing: {
        xs: 'var(--spacing-xs)',
        sm: 'var(--spacing-sm)',
        md: 'var(--spacing-md)',
        lg: 'var(--spacing-lg)',
        xl: 'var(--spacing-xl)',
        '2xl': 'var(--spacing-2xl)',
        '3xl': 'var(--spacing-3xl)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
      },
      fontFamily: {
        primary: 'var(--font-family-primary)',
        mono: 'var(--font-family-mono)',
      },
      fontSize: {
        xs: 'var(--font-size-xs)',
        sm: 'var(--font-size-sm)',
        base: 'var(--font-size-base)',
        lg: 'var(--font-size-lg)',
        xl: 'var(--font-size-xl)',
        '2xl': 'var(--font-size-2xl)',
        '3xl': 'var(--font-size-3xl)',
        '4xl': 'var(--font-size-4xl)',
      },
      fontWeight: {
        normal: 'var(--font-weight-normal)',
        medium: 'var(--font-weight-medium)',
        semibold: 'var(--font-weight-semibold)',
        bold: 'var(--font-weight-bold)',
      },
      lineHeight: {
        tight: 'var(--line-height-tight)',
        normal: 'var(--line-height-normal)',
        relaxed: 'var(--line-height-relaxed)',
      },
      transitionDuration: {
        fast: 'var(--transition-fast)',
        normal: 'var(--transition-normal)',
        slow: 'var(--transition-slow)',
      },
      zIndex: {
        dropdown: 'var(--z-dropdown)',
        sticky: 'var(--z-sticky)',
        fixed: 'var(--z-fixed)',
        modal: 'var(--z-modal-backdrop)',
        modalContent: 'var(--z-modal)',
        popover: 'var(--z-popover)',
        tooltip: 'var(--z-tooltip)',
      },
    },
  },
  plugins: [],
};
```

#### 2. Using Theme Variables in Components
```jsx
// With Tailwind classes
<div className="bg-background-primary text-text-primary border border-border-primary rounded-radius-md shadow-shadow-md">
  Content
</div>

// With arbitrary values
<div className="bg-[var(--color-primary)] text-[var(--text-primary)] p-[var(--spacing-md)]">
  Content
</div>
```

### Rules for Global CSS Theme Usage

#### 1. **Always use CSS Variables for Colors**
```css
/* ✅ Good */
.my-component {
  background-color: var(--color-primary);
  color: var(--text-primary);
}

/* ❌ Bad */
.my-component {
  background-color: #1976d2;
  color: #212121;
}

/* ❌ STRICTLY FORBIDDEN */
.my-component {
  background: linear-gradient(45deg, #1976d2, #1565c0); /* NO GRADIENTS */
}
.my-component::before {
  content: "🚀"; /* NO EMOJIS */
}
```

#### 2. **Structure CSS Variables Hierarchically**
- `--color-*` for raw color values
- `--bg-*` for background colors
- `--text-*` for text colors
- `--border-*` for border colors
- `--spacing-*` for spacing values
- `--shadow-*` for box shadows
- `--radius-*` for border radius
- `--font-*` for typography
- `--z-*` for z-index values

#### 3. **Use Data Attributes for Theme Switching**
```html
<!-- ✅ Good -->
<html data-theme="light">
<html data-theme="dark">

<!-- ❌ Bad -->
<html class="light-theme">
<html class="dark-theme">
```

#### 4. **Implement System Theme Detection**
```javascript
// Detect system preference
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// Listen for changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem('theme')) {
    setTheme(e.matches ? 'dark' : 'light');
  }
});
```

#### 5. **Provide Manual Theme Override**
```javascript
// Always allow user to override system preference
const userTheme = localStorage.getItem('theme');
if (userTheme) {
  setTheme(userTheme);
} else {
  setTheme(prefersDark ? 'dark' : 'light');
}
```

#### 6. **Use CSS Custom Properties for Component Variants**
```css
.my-button {
  background-color: var(--color-primary);
  color: var(--text-inverse);
}

.my-button--secondary {
  background-color: var(--color-secondary);
}

.my-button--outline {
  background-color: transparent;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
}
```

#### 7. **Implement Smooth Transitions**
```css
* {
  transition: background-color var(--transition-normal),
              color var(--transition-normal),
              border-color var(--transition-normal);
}
```

#### 8. **Document Theme Variables**
```javascript
/**
 * Theme Variables Reference:
 *
 * Colors:
 * --color-primary: Main brand color
 * --color-secondary: Secondary brand color
 * --bg-primary: Main background color
 * --text-primary: Primary text color
 *
 * Usage:
 * background-color: var(--bg-primary);
 * color: var(--text-primary);
 */
```

## Material-UI Integration

### Installation and Setup
```bash
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
```

### Theme Provider Setup
```jsx
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  // theme configuration
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* App content */}
    </ThemeProvider>
  );
}
```

### Component Usage
```jsx
import { Button, TextField, Card } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // ✅ APPROVED
import StarIcon from '@mui/icons-material/Star'; // ✅ APPROVED

function MyComponent() {
  return (
    <Card>
      <TextField label="URL" variant="outlined" />
      <Button
        variant="contained"
        color="primary"
        startIcon={<CheckCircleIcon />} // ✅ Use MUI icons only
      >
        Shorten URL
      </Button>
    </Card>
  );
}

// ❌ STRICTLY FORBIDDEN
function BadComponent() {
  return (
    <div>
      <span>🚀</span> {/* NO EMOJIS */}
      <div style={{ background: 'linear-gradient(45deg, red, blue)' }}> {/* NO GRADIENTS */}
        Content
      </div>
    </div>
  );
}
```

## Theming System

### Theme Structure
```jsx
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});
```

### CSS Variables Theme
```jsx
const theme = createTheme({
  cssVariables: true,
  palette: {
    primary: {
      main: '#1976d2',
    },
  },
});

// Generated CSS variables:
// --mui-palette-primary-main: #1976d2
```

### Extending Themes
```jsx
const baseTheme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
  },
});

const extendedTheme = createTheme(baseTheme, {
  palette: {
    secondary: { main: '#dc004e' },
  },
});
```

### Component-Specific Theming
```jsx
const theme = createTheme({
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius,
          textTransform: 'none',
        }),
      },
      variants: [
        {
          props: { variant: 'dashed' },
          style: {
            border: `2px dashed ${theme.palette.primary.main}`,
          },
        },
      ],
    },
  },
});
```

## Styling Approaches

### 1. SX Prop (Recommended)
```jsx
<Box
  sx={{
    display: 'flex',
    flexDirection: 'column',
    p: 2,
    bgcolor: 'background.paper',
    borderRadius: 1,
    boxShadow: 1,
    '&:hover': {
      boxShadow: 3,
    },
  }}
>
  Content
</Box>
```

### 2. Styled Components
```jsx
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));
```

### 3. CSS Classes with Tailwind
```jsx
<div className="flex flex-col p-4 bg-white rounded-lg shadow-md hover:shadow-lg">
  Content
</div>
```

### 4. makeStyles (Legacy)
```jsx
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
  },
}));
```

## Tailwind CSS Integration

### Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1976d2',
        secondary: '#dc004e',
      },
    },
  },
  plugins: [],
};
```

### Utility Classes
```jsx
<div className="bg-blue-500 text-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
  Styled with Tailwind
</div>
```

### Responsive Design
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid */}
</div>
```

### Dark Mode
```jsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  Content
</div>
```

## Component Patterns

### Button Variants
```jsx
// MUI Buttons
<Button variant="contained" color="primary">Primary</Button>
<Button variant="outlined" color="secondary">Secondary</Button>
<Button variant="text">Text</Button>

// Tailwind Buttons
<button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Button
</button>
```

### Form Components
```jsx
// MUI Form
<TextField
  label="URL"
  variant="outlined"
  fullWidth
  sx={{ mb: 2 }}
/>

// Tailwind Form
<input
  type="text"
  placeholder="Enter URL"
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
/>
```

### Cards and Layouts
```jsx
// MUI Card
<Card sx={{ maxWidth: 345 }}>
  <CardContent>
    <Typography variant="h5">Title</Typography>
    <Typography variant="body2">Content</Typography>
  </CardContent>
</Card>

// Tailwind Card
<div className="max-w-sm bg-white rounded-lg shadow-md overflow-hidden">
  <div className="p-6">
    <h5 className="text-xl font-bold mb-2">Title</h5>
    <p className="text-gray-700">Content</p>
  </div>
</div>
```

## Responsive Design

### Breakpoints
```jsx
// MUI Breakpoints
const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

// Usage
<Box sx={{ display: { xs: 'block', md: 'flex' } }}>
  Content
</Box>

// Tailwind Breakpoints
<div className="block md:flex">
  Content
</div>
```

## Accessibility

### ARIA Support
```jsx
// MUI with ARIA
<Button aria-label="Save changes">Save</Button>

// Custom ARIA
<button
  aria-label="Save changes"
  className="bg-blue-500 text-white px-4 py-2 rounded"
>
  Save
</button>
```

### Focus Management
```jsx
// MUI Focus
<Button variant="outlined" autoFocus>Focused Button</Button>

// Tailwind Focus
<button className="focus:outline-none focus:ring-2 focus:ring-blue-500">
  Button
</button>
```

## Performance Considerations

### Bundle Optimization
```javascript
// Tree shaking with MUI
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

// Avoid barrel imports
// import { Button, TextField } from '@mui/material'; // ❌
```

### CSS Optimization
```css
/* Tailwind purging */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  // Only include used styles in production
};
```

## Development Workflow

### Component Development
1. Use MUI components for complex UI elements
2. Apply Tailwind utilities for custom styling
3. Create styled components for reusable patterns
4. Use theme variables for consistency

### Theme Customization
1. Define design tokens in theme configuration
2. Use CSS variables for dynamic theming
3. Create component variants for different use cases
4. Test across different screen sizes and themes

### Best Practices
- Prefer SX prop for component-specific styling
- Use Tailwind for utility-first approach
- Maintain consistent spacing with theme.spacing
- Implement proper color contrast ratios
- Test components in both light and dark modes
- **NEVER use CSS gradients** - use solid colors from the design system
- **NEVER use Unicode icons or emojis** - use Material-UI icons only
- **ALWAYS use approved visual elements** - gradients and emojis are strictly prohibited

## Migration Guide

### From makeStyles to SX
```jsx
// Before
const useStyles = makeStyles({
  root: {
    padding: 16,
    backgroundColor: 'white',
  },
});

// After
<Box sx={{ p: 2, bgcolor: 'background.paper' }}>
  Content
</Box>
```

### From JSS to Emotion
```jsx
// Before (JSS)
const StyledComponent = styled('div')({
  color: 'red',
});

// After (Emotion)
const StyledComponent = styled('div')`
  color: red;
`;
```

This design language ensures consistent, accessible, and performant UI components across the URL Shortener application while leveraging the strengths of both Material-UI and Tailwind CSS.