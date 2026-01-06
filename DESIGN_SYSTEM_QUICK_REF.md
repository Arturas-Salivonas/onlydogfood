# Design System Quick Reference - Tailwind CSS

## Using Tailwind with Custom CSS Variables

All design tokens are configured in Tailwind's @theme directive in globals.css. Access CSS variables using Tailwind's arbitrary value syntax like bg-[var(--color-trust)] and text-[var(--color-text-primary)].

## Color Classes - Quick Copy

### Backgrounds

**Page background:** bg-[var(--color-background-neutral)] → #F6F7F5
**Card background:** bg-[var(--color-background-card)] → #FFFFFF
**Trust soft background:** bg-[var(--color-trust-bg)] → #E8F0EC
**Caution soft background:** bg-[var(--color-caution-bg)] → #F4EEE4

### Text Colors

**Primary text (headings, body):** text-[var(--color-text-primary)] → #1F2933
**Secondary text (meta, helper):** text-[var(--color-text-secondary)] → #6B7280
**Trust green:** text-[var(--color-trust)] → #8FAF9F
**Caution amber:** text-[var(--color-caution)] → #D6B98C

### Borders

**Standard border:** border-[var(--color-border)] → #E5E7EB

### Shadows

**Subtle:** shadow-[var(--shadow-small)]
**Standard:** shadow-[var(--shadow-medium)]
**Elevated:** shadow-[var(--shadow-large)]

## Common Patterns with Tailwind

### Primary Button

Use trust green background with white text:
- bg-[var(--color-trust)]
- text-[var(--color-background-card)]
- shadow-[var(--shadow-medium)]
- px-8 py-4 rounded-lg font-bold

### Secondary Button

Card background with border:
- bg-[var(--color-background-card)]
- border-[var(--color-border)]
- text-[var(--color-text-primary)]
- hover:bg-[var(--color-trust-bg)]

### Card Container

Standard card styling:
- rounded-lg p-6
- bg-[var(--color-background-card)]
- border-[var(--color-border)]
- shadow-[var(--shadow-small)]

### Hero Section
```tsx
<section className="bg-[var(--color-trust-bg)]">
  <div className="py-20">
    <h1 className="text-4xl font-normal mb-4 text-[var(--color-text-primary)]">
      Your heading here
    </h1>
    <p className="text-lg text-[var(--color-text-secondary)]">
      Description text
    </p>
  </div>
</section>
```

### Content Section
```tsx
<section className="py-16 bg-[var(--color-background-card)]">
  {/* Content */}
</section>
```

## Typography with Tailwind

```tsx
// Headings - Always sentence case, font-normal (except H4)
<h1 className="text-4xl md:text-5xl font-normal text-[var(--color-text-primary)]">Heading 1</h1>
<h2 className="text-3xl md:text-4xl font-normal text-[var(--color-text-primary)]">Heading 2</h2>
<h3 className="text-2xl font-normal text-[var(--color-text-primary)]">Heading 3</h3>
<h4 className="text-xl font-bold text-[var(--color-text-primary)]">Heading 4</h4>

// Body text
<p className="text-base text-[var(--color-text-primary)]">Regular paragraph</p>
<p className="text-lg text-[var(--color-text-primary)]">Slightly larger body</p>

// Small/meta text
<span className="text-sm">Small text</span>
<span className="text-sm text-[var(--color-text-secondary)]">Meta info</span>
```

## Spacing with Tailwind

```tsx
// Padding
className="p-6"        // 24px - comfortable
className="p-8"        // 32px - generous
className="px-4 py-3"  // Custom combination

// Margins
className="mb-4"       // 16px
className="mb-6"       // 24px
className="mb-8"       // 32px

// Gaps (flex/grid)
className="gap-4"      // 16px
className="gap-6"      // 24px
className="gap-8"      // 32px
```

## Border Radius

```tsx
className="rounded"     // 4px - small
className="rounded-lg"  // 8px - standard (most common)
className="rounded-xl"  // 12px - large (special cases)
```

## Complete Examples

### Trust Button (CTA)
```tsx
<Link
  href="/action"
  className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-bold text-base hover:opacity-90 transition-all bg-[var(--color-trust)] text-[var(--color-background-card)] shadow-[var(--shadow-medium)]"
>
  Get started
  <span>→</span>
</Link>
```

### Neutral Button
```tsx
<button className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-normal text-base transition-all border border-[var(--color-border)] bg-[var(--color-background-card)] text-[var(--color-text-primary)] hover:bg-[var(--color-trust-bg)]">
  Learn more
</button>
```

### Card with Shadow
```tsx
<div className="rounded-lg p-6 md:p-8 bg-[var(--color-background-card)] border border-[var(--color-border)] shadow-[var(--shadow-small)]">
  <h3 className="text-lg font-bold mb-3 text-[var(--color-text-primary)]">Card title</h3>
  <p className="text-sm text-[var(--color-text-secondary)]">Card description</p>
</div>
```

### Step/Feature Card
```tsx
<div className="text-center">
  <div className="w-20 h-20 rounded-lg flex items-center justify-center text-2xl font-normal mx-auto mb-6 bg-[var(--color-trust-bg)] text-[var(--color-text-primary)] shadow-[var(--shadow-small)]">
    1
  </div>
  <h3 className="text-lg font-bold mb-3 text-[var(--color-text-primary)]">Step title</h3>
  <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
    Description text here
  </p>
</div>
```

## Rules Checklist

### Typography
- [ ] All text in sentence case (no ALL CAPS)
- [ ] Headings use `font-normal` (except H4 uses `font-bold`)
- [ ] Body text uses comfortable sizes
- [ ] Inter font family applied (via `@theme`)

### Colors
- [ ] No pure black or pure white
- [ ] No red colors used
- [ ] Green (trust) only for positive states
- [ ] Amber (caution) only for warnings
- [ ] All colors meet WCAG AA contrast

### Spacing
- [ ] Cards use `p-6` or `p-8` (24-32px)
- [ ] Generous white space with proper `gap-*` classes
- [ ] Consistent spacing in layouts

### Tailwind Best Practices
- [ ] Use bg-[var(--color-name)] for custom colors (example: bg-[var(--color-trust)])
- [ ] Use text-[var(--color-name)] for text colors (example: text-[var(--color-text-primary)])
- [ ] Use shadow-[var(--shadow-size)] for shadows (example: shadow-[var(--shadow-medium)])
- [ ] Combine with standard Tailwind utilities (px-8, py-4, etc.)

## Migration: Inline Styles → Tailwind

### Before (Inline Styles)
```tsx
<div
  className="rounded-lg p-6"
  style={{
    backgroundColor: 'var(--color-trust)',
    color: 'var(--color-background-card)'
  }}
>
```

### After (Tailwind)
```tsx
<div className="rounded-lg p-6 bg-[var(--color-trust)] text-[var(--color-background-card)]">
```
