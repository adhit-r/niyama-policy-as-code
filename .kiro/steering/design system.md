---
inclusion: fileMatch
fileMatchPattern: ['frontend/src/**/*.tsx', 'frontend/src/**/*.ts', 'frontend/src/**/*.css']
---

# Niyama Design System

## Design Philosophy: New Brutalist Professional

Enterprise-grade brutalist design with high contrast, sharp edges, and functional aesthetics.

### Core Design Rules (ALWAYS FOLLOW)
- **Colors**: Black (`#000000`), White (`#ffffff`), Orange accent (`#ff6b35`) only
- **Borders**: Always `border-2 border-black` on components
- **Shadows**: Use brutalist shadows (`shadow-brutal`) - never standard Tailwind shadows
- **Border Radius**: Maximum `rounded` (4px) - never `rounded-lg` or higher
- **Typography**: Space Grotesk for headings (`font-display`), Inter for body (`font-sans`)
- **Spacing**: Use Tailwind's 4px-based scale consistently
- **Orange Usage**: Sparingly - maximum 1-2 orange elements per screen

## Color System

### Primary Colors (REQUIRED)
```css
/* Use these exact values */
--black: #000000      /* Text, borders, primary buttons */
--white: #ffffff      /* Backgrounds, surfaces */
--orange: #ff6b35     /* Primary actions only - use sparingly */
--orange-dark: #e55a2b /* Hover states */
```

### Tailwind Classes to Use
- **Text**: `text-black`, `text-white`, `text-gray-700`, `text-gray-500`
- **Backgrounds**: `bg-white`, `bg-black`, `bg-gray-100`, `bg-orange-500`
- **Borders**: `border-black` (always with `border-2`)
- **Status Colors**: `text-green-500`, `text-red-500`, `text-yellow-500`, `text-blue-500`
## Typography Rules

### Font Classes (ALWAYS USE)
- **Headings**: `font-display font-bold` (Space Grotesk)
- **Body Text**: `font-sans` (Inter)
- **Code**: `font-mono` (JetBrains Mono)

### Common Typography Patterns
```tsx
// Page title
<h1 className="font-display font-bold text-4xl text-black mb-2">

// Section heading  
<h2 className="font-display font-bold text-2xl text-black mb-4">

// Body text
<p className="font-sans text-base text-gray-700">

// Small text
<span className="font-sans text-sm text-gray-500">
```
## Spacing & Layout Standards

### Standard Spacing (USE THESE)
- **Cards**: `p-6` (24px padding)
- **Buttons**: `px-6 py-3` (24px horizontal, 12px vertical)
- **Sections**: `mb-8` or `mb-12` (32px or 48px)
- **Page Container**: `max-w-7xl mx-auto px-4`
- **Grid Gaps**: `gap-6` (24px between items)

### Layout Patterns
```tsx
// Page wrapper
<div className="min-h-screen bg-gray-50">
  <main className="max-w-7xl mx-auto px-4 py-8">

// Card grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```
## Border Radius (STRICT LIMITS)

**NEVER exceed `rounded` (4px) - this maintains brutalist aesthetic**

- `rounded-none` - Preferred for sharp edges
- `rounded` - Maximum allowed (4px)
- ❌ `rounded-lg`, `rounded-xl` - FORBIDDEN
## Shadows (BRUTALIST ONLY)

**ALWAYS use brutalist shadows - never standard Tailwind shadows**

```css
/* Add these to tailwind.config.js */
boxShadow: {
  'brutal': '4px 4px 0px 0px #000000',
  'brutal-lg': '8px 8px 0px 0px #000000',
}
```

- **Default**: `shadow-brutal` for all cards and buttons
- **Hover**: `shadow-brutal-lg` for interactive states
- ❌ Never use `shadow-sm`, `shadow-md`, etc.
## Required Component Patterns

### Buttons (COPY THESE EXACTLY)

```tsx
// Primary button (black)
<button className="bg-black text-white border-2 border-black px-6 py-3 font-semibold shadow-brutal hover:shadow-brutal-lg hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150">
  Primary Action
</button>

// Secondary button (white)
<button className="bg-white text-black border-2 border-black px-6 py-3 font-semibold shadow-brutal hover:shadow-brutal-lg hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150">
  Secondary Action
</button>

// Orange accent (use sparingly)
<button className="bg-orange-500 text-white border-2 border-orange-500 px-6 py-3 font-semibold shadow-brutal hover:shadow-brutal-lg hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150">
  Primary CTA
</button>
```
### Cards (STANDARD PATTERN)

```tsx
// Basic card
<div className="bg-white border-2 border-black rounded shadow-brutal p-6">
  <h3 className="font-display font-bold text-xl mb-4">Card Title</h3>
  <p className="text-gray-700">Card content...</p>
</div>

// Interactive card
<div className="bg-white border-2 border-black rounded shadow-brutal hover:shadow-brutal-lg hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150 p-6 cursor-pointer">
  <h3 className="font-display font-bold text-xl mb-4">Clickable Card</h3>
  <p className="text-gray-700">Content...</p>
</div>

// Card with header
<div className="bg-white border-2 border-black rounded shadow-brutal overflow-hidden">
  <div className="bg-gray-100 border-b-2 border-black p-6">
    <h3 className="font-display font-bold text-xl">Header</h3>
  </div>
  <div className="p-6">
    <p className="text-gray-700">Content...</p>
  </div>
</div>
```
### Forms (REQUIRED PATTERNS)

```tsx
// Input field
<input className="w-full bg-white border-2 border-black rounded px-4 py-3 text-base focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20" />

// Label
<label className="block text-sm font-semibold text-gray-700 mb-2">Field Label</label>

// Form group
<div className="mb-6">
  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
  <input className="w-full bg-white border-2 border-black rounded px-4 py-3 text-base focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
</div>
```

### Navigation

```tsx
// Header
<header className="bg-white border-b-2 border-black px-6 py-4">
  <div className="flex items-center justify-between max-w-7xl mx-auto">
    <h1 className="font-display font-black text-2xl">Niyama</h1>
    <nav className="flex space-x-6">
      <a className="text-gray-700 hover:text-black px-3 py-2 rounded hover:bg-gray-100 transition-colors">
        Dashboard
      </a>
    </nav>
  </div>
</header>
```
## CRITICAL IMPLEMENTATION RULES

### ALWAYS Include These Classes
- **All cards**: `bg-white border-2 border-black rounded shadow-brutal p-6`
- **All buttons**: `border-2 border-black px-6 py-3 font-semibold shadow-brutal hover:shadow-brutal-lg hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150`
- **All inputs**: `bg-white border-2 border-black rounded px-4 py-3 focus:border-orange-500 focus:outline-none`
- **Page titles**: `font-display font-bold text-4xl text-black mb-2`

### NEVER Use These
- ❌ `rounded-lg`, `rounded-xl`, `rounded-full`
- ❌ `shadow-sm`, `shadow-md`, `shadow-lg` (use `shadow-brutal` instead)
- ❌ Gradients or complex visual effects
- ❌ More than 2 orange elements per screen
- ❌ Low contrast color combinations

### Hover Pattern (ALWAYS USE)
```tsx
className="hover:shadow-brutal-lg hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150"
```
## Quick Reference Templates

### Complete Button Set
```tsx
// Primary (black)
<button className="bg-black text-white border-2 border-black px-6 py-3 font-semibold shadow-brutal hover:shadow-brutal-lg hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150">
  Primary
</button>

// Secondary (white)  
<button className="bg-white text-black border-2 border-black px-6 py-3 font-semibold shadow-brutal hover:shadow-brutal-lg hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150">
  Secondary
</button>

// Accent (orange - use sparingly)
<button className="bg-orange-500 text-white border-2 border-orange-500 px-6 py-3 font-semibold shadow-brutal hover:shadow-brutal-lg hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150">
  Primary CTA
</button>
```

### Page Template
```tsx
<div className="min-h-screen bg-gray-50">
  <main className="max-w-7xl mx-auto px-4 py-8">
    <div className="mb-8">
      <h1 className="font-display font-bold text-4xl text-black mb-2">Page Title</h1>
      <p className="text-gray-600">Description</p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Cards go here */}
    </div>
  </main>
</div>
```
## AI Assistant Instructions

When creating or modifying Niyama frontend components:

### 1. ALWAYS Start With These Base Classes
- **Card**: `bg-white border-2 border-black rounded shadow-brutal p-6`
- **Button**: `border-2 border-black px-6 py-3 font-semibold shadow-brutal hover:shadow-brutal-lg hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150`
- **Input**: `bg-white border-2 border-black rounded px-4 py-3 focus:border-orange-500 focus:outline-none`

### 2. Color Usage Rules
- **Primary**: Black (`bg-black`, `text-black`, `border-black`)
- **Secondary**: White (`bg-white`, `text-white`)
- **Accent**: Orange (`bg-orange-500`) - maximum 1-2 per screen
- **Text**: `text-black`, `text-gray-700`, `text-gray-500`

### 3. Typography Patterns
- **Page titles**: `font-display font-bold text-4xl text-black`
- **Section headings**: `font-display font-bold text-2xl text-black`
- **Body text**: `font-sans text-base text-gray-700`

### 4. Spacing Standards
- **Card padding**: `p-6`
- **Button padding**: `px-6 py-3`
- **Grid gaps**: `gap-6`
- **Section margins**: `mb-8`

### 5. Forbidden Elements
- ❌ `rounded-lg` or higher border radius
- ❌ Standard Tailwind shadows (`shadow-sm`, `shadow-md`)
- ❌ Gradients or complex effects
- ❌ More than 2 orange elements per screen

### 6. Required Accessibility
```tsx
// Focus states
className="focus:outline-none focus:ring-2 focus:ring-orange-500"

// ARIA labels
<button aria-label="Close dialog">×</button>
```
## Tailwind Configuration Required

Add these custom utilities to `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        'display': ['Space Grotesk', 'sans-serif'],
        'sans': ['Inter', 'sans-serif'],
      },
      colors: {
        'orange': {
          500: '#ff6b35',
          600: '#e55a2b',
        }
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px #000000',
        'brutal-lg': '8px 8px 0px 0px #000000',
      }
    }
  }
}
```

## Component Checklist

Before submitting any component, verify:

- ✅ Uses `border-2 border-black`
- ✅ Uses `shadow-brutal` (never standard shadows)
- ✅ Border radius ≤ `rounded` (4px max)
- ✅ Includes hover states with translate effect
- ✅ Uses approved color palette only
- ✅ Includes focus states for accessibility
- ✅ Orange used sparingly (max 1-2 elements)
- ✅ Typography uses `font-display` for headings
- ✅ Spacing follows 4px grid system

