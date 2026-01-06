import { Metadata } from 'next';

interface ResourceHintsProps {
  fonts?: string[];
  images?: string[];
  scripts?: string[];
}

// Generate resource hints for better performance
export function generateResourceHints({
  fonts = [],
  images = [],
  scripts = [],
}: ResourceHintsProps = {}): Partial<Metadata> {
  const hints: Partial<Metadata> = {};

  // Preload critical fonts
  if (fonts.length > 0) {
    const fontHints = fonts.reduce((acc, font, index) => ({
      ...acc,
      [`font-${index}`]: `rel="preload" as="font" type="font/woff2" crossorigin href="${font}"`,
    }), {});

    hints.other = {
      ...hints.other,
      ...fontHints,
    } as any;
  }

  // Preload critical images
  if (images.length > 0) {
    const imageHints = images.reduce((acc, image, index) => ({
      ...acc,
      [`image-${index}`]: `rel="preload" as="image" href="${image}"`,
    }), {});

    hints.other = {
      ...hints.other,
      ...imageHints,
    } as any;
  }

  // Preload critical scripts
  if (scripts.length > 0) {
    const scriptHints = scripts.reduce((acc, script, index) => ({
      ...acc,
      [`script-${index}`]: `rel="preload" as="script" href="${script}"`,
    }), {});

    hints.other = {
      ...hints.other,
      ...scriptHints,
    } as any;
  }

  return hints;
}

// Common resource hints for the app
export const commonResourceHints: Metadata = generateResourceHints({
  fonts: [
    // Inter font is loaded via Google Fonts in globals.css
  ],
  images: [
    // Add critical hero images or logos here
  ],
});