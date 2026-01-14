# Font System Update - January 11, 2026

## Changes Summary

The OnlyDogFood design system has been updated with a new dual-font system to enhance visual hierarchy and readability.

## New Font Configuration

### Libre Baskerville (Serif)
**Used for:**
- All headings (h1, h2, h3, h4, h5, h6)
- All links and anchor tags
- All buttons and CTAs
- Navigation menu items
- Footer text

**Weights loaded:** Regular (400), Bold (700), Italic

**Why Libre Baskerville?**
- Classic, trustworthy serif font
- Excellent for creating hierarchy and establishing authority
- Perfect for headings and actionable elements
- Creates clear distinction between navigation/actions and content

### Source Sans 3 (Sans-serif)
**Used for:**
- All body text and paragraphs
- General content text
- Descriptions and explanations

**Weights loaded:** Light (300), Regular (400), Semi-Bold (600), Bold (700), Italic

**Why Source Sans 3?**
- Highly readable for body text
- Clean, modern appearance
- Excellent screen readability
- Warm and approachable feel

## Technical Implementation

### Files Modified

1. **`app/globals.css`**
   - Updated Google Fonts import to include both Libre Baskerville and Source Sans 3
   - Added `--font-serif` CSS variable for Libre Baskerville
   - Updated `--font-sans` to use Source Sans 3 as primary
   - Added font-family rules for all heading elements (h1-h6)
   - Added font-family rules for links, buttons, nav, and footer elements
   - Added h5 and h6 heading styles

2. **`DESIGN_SYSTEM_IMPLEMENTATION.md`**
   - Updated typography section to reflect new dual-font system
   - Documented which elements use which font

3. **`DESIGN_SYSTEM_QUICK_REF.md`**
   - Added font system overview at the top
   - Clear distinction between serif and sans-serif usage

## CSS Variables

```css
--font-sans: 'Source Sans 3', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
--font-serif: 'Libre Baskerville', Georgia, serif;
```

## Global CSS Rules

```css
/* Body uses sans-serif by default */
body {
  font-family: var(--font-sans);
}

/* All headings use serif */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-serif);
}

/* All interactive/navigational elements use serif */
a, button, nav, footer {
  font-family: var(--font-serif);
}
```

## Component Impact

All components will automatically inherit the new font system:

- **Header.tsx** - Navigation links will use Libre Baskerville
- **Footer.tsx** - All footer text and links will use Libre Baskerville
- **Button.tsx** - All buttons will use Libre Baskerville
- **All page content** - Body text uses Source Sans 3, headings use Libre Baskerville

## Browser Compatibility

Both fonts are loaded from Google Fonts CDN with proper fallbacks:
- Libre Baskerville → Georgia → serif
- Source Sans 3 → system-ui → -apple-system → BlinkMacSystemFont → sans-serif

## Testing Recommendations

1. Test visual hierarchy on all pages
2. Verify font loading performance
3. Check readability on mobile devices
4. Ensure proper font fallback behavior
5. Test in multiple browsers (Chrome, Firefox, Safari, Edge)

## Font Loading Strategy

Using `display=swap` parameter in Google Fonts URL to:
- Show fallback font immediately
- Swap to custom font when loaded
- Prevent layout shift (FOUT - Flash of Unstyled Text)

## Accessibility

Both fonts maintain excellent readability:
- High x-height for better legibility
- Clear letter differentiation
- Optimal spacing and kerning
- WCAG AA compliant when used with design system colors
