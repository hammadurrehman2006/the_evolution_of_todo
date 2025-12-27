# UI Components

This directory contains reusable UI components for the Todo application. Each component follows consistent styling and patterns to maintain a cohesive user experience.

## Available Components

### Layout Components
- **Header** - Navigation header with authentication controls
- **Footer** - Site footer with links and information
- **Sidebar** - Navigation sidebar for authenticated users
- **Layout** - Main layout wrapper with header and footer
- **MobileNav** - Responsive mobile navigation menu

### Form Components
- **TodoForm** - Form for creating and editing todo items
- **Button** - Consistent button styling with variants and loading states

### Display Components
- **Card** - Content container with optional header
- **Alert** - Alert messages for errors, success, warnings, and info
- **LoadingSpinner** - Animated loading spinner with different sizes

### Utility Components
- **SessionManager** - Manages user authentication state
- **SessionProvider** - Provides session context to the app
- **ErrorMessage** - Standardized error message display
- **SuccessMessage** - Standardized success message display

## Usage

All components are designed to be reusable and follow the same styling patterns using Tailwind CSS. They can be imported and used throughout the application:

```tsx
import Header from '@/components/header';
import Card from '@/components/card';
import Button from '@/components/button';
```

## Design Principles

- Consistent styling using Tailwind CSS
- Responsive design for all screen sizes
- Accessibility considerations
- Type safety with TypeScript
- Reusability across the application