# Niyama Design System

**New Brutalist Professional Design System**

A comprehensive design system for the Niyama Policy as Code Platform, built on brutalist design principles with professional polish and enterprise-grade aesthetics.

## Overview

The Niyama Design System is a modern interpretation of brutalist design principles, emphasizing:

- **High contrast** for accessibility and clarity
- **Minimal border radius** for sharp, defined edges
- **Bold typography** with clear hierarchy
- **Consistent orange accent** branding
- **Professional appearance** without unnecessary decoration
- **Functional over decorative** design philosophy

## Design Philosophy

### New Brutalist Professional

Our design system combines the raw, honest aesthetic of brutalism with the refined polish expected in enterprise software. This creates a unique visual identity that is both bold and professional.

**Core Principles:**
1. **Functionality First** - Every design element serves a purpose
2. **High Contrast** - Maximum readability and accessibility
3. **Sharp Edges** - Minimal border radius for defined boundaries
4. **Bold Typography** - Clear hierarchy and strong presence
5. **Consistent Branding** - Orange accent used strategically
6. **Professional Polish** - Enterprise-ready without being sterile

## Color System

### Primary Colors

- **Black (#000000)** - Primary text, borders, and primary actions
- **White (#ffffff)** - Backgrounds, card surfaces, and secondary text

### Accent Colors

- **Orange (#ff6b35)** - Primary accent for branding and key actions
- **Orange Dark (#e55a2b)** - Hover states and active elements
- **Orange Light (#ff8c69)** - Subtle accents and backgrounds

### Gray Scale

A comprehensive 9-step gray scale from lightest to darkest:

- **Gray 100 (#f5f5f5)** - Lightest backgrounds
- **Gray 200 (#e5e5e5)** - Subtle borders and dividers
- **Gray 300 (#d4d4d4)** - Disabled states
- **Gray 400 (#a3a3a3)** - Placeholder text
- **Gray 500 (#737373)** - Body text
- **Gray 600 (#525252)** - Emphasized text
- **Gray 700 (#404040)** - Secondary headings
- **Gray 800 (#262626)** - Dark mode backgrounds
- **Gray 900 (#171717)** - Code backgrounds

### Semantic Colors

- **Success (#22c55e)** - Positive states and confirmations
- **Warning (#f59e0b)** - Caution and attention states
- **Error (#ef4444)** - Errors and destructive actions
- **Info (#3b82f6)** - Information and neutral states
- **Purple (#8b5cf6)** - AI features and special functionality

## Typography

### Font Families

- **Primary (Inter)** - Body text, UI elements, and general content
- **Display (Space Grotesk)** - Headings, titles, and branding
- **Mono (JetBrains Mono)** - Code, technical content, and inline code

### Font Scale

A brutalist-inspired scale with clear hierarchy:

- **Display (48px)** - Hero text and large headings
- **Heading 1 (36px)** - Page titles
- **Heading 2 (30px)** - Section headings
- **Heading 3 (24px)** - Subsection headings
- **Body Large (18px)** - Emphasized body text
- **Body (16px)** - Standard body text
- **Caption (14px)** - Labels and secondary text
- **Small (12px)** - Fine print and metadata

### Font Weights

- **Light (300)** - Subtle emphasis
- **Normal (400)** - Standard text
- **Medium (500)** - Slight emphasis
- **Semibold (600)** - Strong emphasis
- **Bold (700)** - Headings and important text
- **Black (900)** - Branding and display text

## Spacing System

### Brutalist Grid

Based on a 4px base unit with consistent scaling:

- **1 (4px)** - Extra small spacing
- **2 (8px)** - Small spacing
- **3 (12px)** - Medium small spacing
- **4 (16px)** - Base spacing
- **5 (20px)** - Medium spacing
- **6 (24px)** - Large spacing
- **8 (32px)** - Extra large spacing
- **10 (40px)** - 2X large spacing
- **12 (48px)** - 3X large spacing
- **16 (64px)** - 4X large spacing
- **20 (80px)** - 5X large spacing
- **24 (96px)** - 6X large spacing
- **32 (128px)** - 8X large spacing

## Border Radius

### Minimal Approach

Sharp, defined edges with minimal rounding:

- **None (0px)** - Sharp edges for brutalist aesthetic
- **Small (2px)** - Subtle rounding
- **Base (4px)** - Standard rounding
- **Medium (6px)** - Moderate rounding
- **Large (8px)** - Generous rounding
- **Extra Large (12px)** - Maximum rounding

## Shadows

### Brutalist Shadows

Hard-edged shadows that create depth and hierarchy:

- **Brutal (4px 4px 0px 0px #000000)** - Signature brutalist shadow
- **Brutal Large (8px 8px 0px 0px #000000)** - Enhanced depth
- **Brutal Small (2px 2px 0px 0px #000000)** - Subtle depth
- **Standard shadows** - For subtle depth when needed

## Components

### Buttons

Three primary variants with consistent brutalist styling:

#### Primary Button
- Black background with white text
- Brutalist shadow with hover animation
- Used for primary actions

#### Secondary Button
- White background with black text and border
- Brutalist shadow with hover animation
- Used for secondary actions

#### Accent Button
- Orange background with white text
- Brutalist shadow with hover animation
- Used for key actions and branding

#### Button Sizes
- **Small** - Compact actions
- **Medium** - Standard actions
- **Large** - Prominent actions
- **Extra Large** - Hero actions

### Cards

Consistent card system with brutalist styling:

- White background with black border
- Brutalist shadow for depth
- Hover animation with enhanced shadow
- Structured header, content, and footer areas

### Forms

Clean, functional form elements:

- Black borders with orange focus states
- Consistent padding and typography
- Clear labels and error states
- Accessible focus indicators

### Navigation

Professional navigation system:

- Clean horizontal layout
- Space Grotesk branding
- Clear active states
- Responsive design

## Accessibility

### Contrast Ratios

All color combinations meet WCAG AA standards:

- **Normal text**: 4.5:1 minimum contrast ratio
- **Large text**: 3:1 minimum contrast ratio

### Focus States

- Orange outline for keyboard navigation
- Clear visual indicators
- Consistent across all interactive elements

### Color Blind Support

- High contrast design works for all color vision types
- Patterns and shapes supplement color coding
- Clear typography hierarchy

## Usage Guidelines

### Do's

- Use black borders on all cards and components
- Apply brutalist shadows for depth and hierarchy
- Use orange strategically for primary actions and branding
- Maintain high contrast ratios for accessibility
- Use consistent spacing from the grid system
- Apply sharp, minimal border radius

### Don'ts

- Don't use excessive border radius
- Don't mix different shadow styles
- Don't use low contrast color combinations
- Don't overuse the orange accent color
- Don't use decorative elements without purpose
- Don't ignore accessibility guidelines

## Implementation

### CSS Custom Properties

All design tokens are available as CSS custom properties:

```css
:root {
  --niyama-black: #000000;
  --niyama-white: #ffffff;
  --niyama-accent: #ff6b35;
  /* ... all other tokens */
}
```

### Tailwind CSS

Extended Tailwind configuration with custom values:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'niyama-black': '#000000',
        'niyama-accent': '#ff6b35',
        // ... all custom colors
      }
    }
  }
}
```

### TypeScript Support

Full TypeScript definitions for type safety:

```typescript
import { ButtonProps, ColorType, SpacingType } from './design-system/types';
```

## Resources

- **Design System JSON**: `design-system.json` - Complete design tokens
- **TypeScript Types**: `frontend/src/design-system/types.ts` - Type definitions
- **CSS Variables**: `frontend/src/styles/design-system.css` - CSS implementation
- **Tailwind Config**: `frontend/tailwind.config.js` - Tailwind integration

## Contributing

When contributing to the design system:

1. Follow the established patterns and principles
2. Ensure all changes maintain accessibility standards
3. Update both the JSON and TypeScript definitions
4. Test across different screen sizes and devices
5. Document any new tokens or components

## Version History

- **v1.0.0** - Initial release with brutalist design system
- Complete color palette and typography scale
- Component library with buttons, cards, and forms
- Accessibility guidelines and implementation guides
