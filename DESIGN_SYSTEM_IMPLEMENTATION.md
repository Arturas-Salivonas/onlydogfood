# Design System Implementation Guide

## Overview
This document outlines the new OnlyDogFood design system implementation completed on January 5, 2026.

## Design Philosophy
**"A smart friend who has done the homework and isn't trying to sell you."**

- **Calm, not cold** - Supportive and reassuring
- **Supportive, not emotional** - Balanced and helpful
- **Neutral authority** - Trust-first approach
- **Intentionally boring** - In the best possible way

## Core Changes Implemented

### 1. Typography
- **Font Family**: Switched from Geist Sans/Mono to **Inter**
  - Light (300), Regular (400), Bold (700), Italic
  - Google Fonts CDN integration in globals.css
  - Fallback: Source Sans 3, system-ui, -apple-system, BlinkMacSystemFont

- **Type Hierarchy**:
  - H1: 36px (2.25rem) / 44px line-height / weight 400 / Calm, sentence case
  - H2: 30px (1.875rem) / 38px line-height / weight 400
  - H3: 24px (1.5rem) / 32px line-height / weight 400
  - H4: 20px (1.25rem) / 28px line-height / weight 700 (Bold for emphasis)
  - Body: 17px (1.0625rem) / 28px line-height / Slightly larger for comfort
  - Small: 14px (0.875rem) / 20px line-height
  - Meta: 13px (0.8125rem) / 18px line-height

- **Typography Rules**:
  - Sentence case everywhere (no ALL CAPS)
  - Bold only for emphasis, never for fear
  - No decorative fonts

### 2. Color System (WCAG AA Compliant)

#### Color Roles
```css
/* Backgrounds */
--color-background-neutral: #F6F7F5
--color-background-card: #FFFFFF

/* Text */
--color-text-primary: #1F2933
--color-text-secondary: #6B7280

/* Trust / Positive (Safe First Choice) */
--color-trust: #8FAF9F
--color-trust-bg: #E8F0EC

/* Caution (Not Safe First Choice) */
--color-caution: #D6B98C
--color-caution-bg: #F4EEE4

/* Structure */
--color-divider: #E5E7EB
--color-border: #E5E7EB
```

#### Color Rules
- Never use pure black (#000000) or pure white (#FFFFFF)
- Never use red (anxiety-inducing)
- Green is only for trust-positive states
- Amber/caution for warnings only

### 3. Spacing System
White space is part of the UX — it slows people down and lowers anxiety.

```css
--spacing-micro: 4px
--spacing-tight: 8px
--spacing-standard: 16px
--spacing-comfortable: 24px
--spacing-generous: 32px
--spacing-xl: 48px
--spacing-xxl: 64px
```

**Card Padding Defaults**: 24-32px for comfortable reading

### 4. Visual Elements

#### Border Radius
```css
--radius-small: 4px
--radius-medium: 8px (primary)
--radius-large: 12px
```

#### Shadows (Subtle and Calm)
```css
--shadow-small: 0 1px 2px 0 rgba(31, 41, 51, 0.08)
--shadow-medium: 0 2px 8px 0 rgba(31, 41, 51, 0.08)
--shadow-large: 0 4px 16px 0 rgba(31, 41, 51, 0.08)
```

## Files Updated

### Core System Files
✅ `/lib/design-tokens.ts` - New design tokens configuration
✅ `/app/globals.css` - Complete CSS rewrite with new system
✅ `/app/layout.tsx` - Removed Geist font imports
✅ `/package.json` - Removed @fontsource/geist-* dependencies

### Layout Components
✅ `/components/layout/Header.tsx` - New colors, sentence case, Inter font
✅ `/components/layout/Footer.tsx` - New colors, sentence case navigation
✅ `/components/layout/PageHero.tsx` - Calm hero design, trust background

### Page Components
✅ `/components/pages/HomePage.tsx` - Complete redesign:
  - Calm hero with trust-green background
  - Sentence case headings
  - New button styles with trust colors
  - Comfortable spacing throughout
  - Trust-first color scheme

## Implementation Pattern

### Using Design Tokens in Components
```tsx
// Color usage
style={{ backgroundColor: 'var(--color-trust)' }}
style={{ color: 'var(--color-text-primary)' }}

// Shadow usage
style={{ boxShadow: 'var(--shadow-medium)' }}

// Spacing usage
style={{ padding: 'var(--spacing-comfortable)' }}
```

### Button Pattern (Trust-positive)
```tsx
<Link
  href="/path"
  className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-bold text-base hover:opacity-90 transition-all"
  style={{
    backgroundColor: 'var(--color-trust)',
    color: 'var(--color-background-card)',
    boxShadow: 'var(--shadow-medium)'
  }}
>
  Action text
</Link>
```

### Secondary Button Pattern
```tsx
<Link
  href="/path"
  className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-normal text-base transition-all border"
  style={{
    color: 'var(--color-text-primary)',
    borderColor: 'var(--color-border)',
    backgroundColor: 'var(--color-background-card)'
  }}
>
  Secondary action
</Link>
```

## Remaining Work

### High Priority
1. Update all UI components in `/components/ui/`:
   - ScoreDisplay.tsx - Update score badges with trust/caution colors
   - Button.tsx - Standardize button styles
   - CustomSelect.tsx - New visual style
   - BrandCard.tsx, FoodCard.tsx - Card redesign with new spacing
   - StatsSection.tsx, BestFoodsSection.tsx - Apply new design

2. Update page components:
   - BrandsPage.tsx - Apply new hero and card styles
   - DogFoodPage.tsx - Filter UI and product cards
   - ComparePage.tsx - Comparison table styling
   - HowWeScorePage.tsx - Content sections
   - MethodologyPage.tsx - Typography and layout

3. Update feature components:
   - ProductDetail.tsx - Detail page redesign
   - Admin components - Admin interface styling

### Testing Checklist
- [ ] All pages load without style errors
- [ ] Typography hierarchy is consistent
- [ ] Color contrast meets WCAG AA standards
- [ ] Spacing feels calm and comfortable
- [ ] No remnants of old color system (golden/teal)
- [ ] Mobile responsive design maintained
- [ ] Interactive states (hover, focus) work correctly

## Migration Notes

### Old → New Color Mapping
```
OLD                  → NEW
--primary (#FFCA69)  → --color-trust (#8FAF9F)
--secondary (#0AC5B1) → --color-trust (#8FAF9F)
--accent (#8b7355)   → --color-caution (#D6B98C)
--foreground         → --color-text-primary
--background         → --color-background-neutral
```

### Text Transformation Rules
```
"FIND THE BEST" → "Find the best"
"Browse All Dog Foods" → "Browse all dog foods"
"Admin Panel" → "Admin panel"
"How We Score" → "How we score"
```

### Removed Packages
To clean up node_modules, run:
```bash
npm uninstall @fontsource/geist-mono @fontsource/geist-sans
npm install
```

## Design System Resources

### Design Tokens File
Location: `/lib/design-tokens.ts`
Export: `designTokens` object and `generateCSSVariables()` function

### Global Styles
Location: `/app/globals.css`
Includes: CSS variables, typography, base styles, scrollbar customization

### Usage Examples
See implemented components:
- Header: Demonstrates navigation styling
- HomePage: Demonstrates full page layout
- PageHero: Demonstrates hero section pattern

## Support & Questions

For questions about the design system:
1. Refer to this guide
2. Check `/lib/design-tokens.ts` for available tokens
3. Review implemented examples in Header.tsx and HomePage.tsx
4. Ensure all new components follow sentence case and calm design principles

---
**Last Updated**: January 5, 2026
**Status**: Core implementation complete, UI components in progress
