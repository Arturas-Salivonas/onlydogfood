import { Metadata } from 'next';
import { Product, Brand } from '@/types';

const BASE_URL = 'https://onlydogfood.com';
const SITE_NAME = 'OnlyDogFood.com';

/**
 * Generate default metadata for the site
 */
export const DEFAULT_METADATA: Metadata = {
  title: {
    default: `${SITE_NAME} - Dog Food Ratings & Comparisons`,
    template: `%s | ${SITE_NAME}`,
  },
  description: 'Compare 200+ dog food brands. Science-based ratings, nutritional analysis, and price comparisons to find the best food for your dog.',
  keywords: ['dog food', 'dog food reviews', 'best dog food', 'dog food comparison', 'pet nutrition'],
  authors: [{ name: SITE_NAME }],
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: BASE_URL,
    siteName: SITE_NAME,
  },
  twitter: {
    card: 'summary_large_image',
  },
};

/**
 * Create metadata for a product page
 */
export function createProductMetadata(product: Product): Metadata {
  const title = `${product.name} by ${product.brand?.name} - Review & Rating`;
  const description = product.meta_description ||
    `Detailed review, nutritional analysis, and rating for ${product.name}. Score: ${product.overall_score}/100. Compare prices and read ingredient breakdown.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: product.image_url ? [{
        url: product.image_url,
        width: 1200,
        height: 630,
        alt: product.name
      }] : [],
      url: `${BASE_URL}/dog-food/${product.slug}`,
      type: 'website', // Changed from 'product' to 'website' for Next.js compatibility
    }
  };
}

/**
 * Create metadata for a brand page
 */
export function createBrandMetadata(brand: Brand, productCount?: number): Metadata {
  const title = `${brand.name} Dog Food - Reviews & Ratings`;
  const description = brand.description ||
    `Explore ${brand.name} dog food products. ${productCount ? `${productCount} products` : 'Multiple products'} with detailed reviews, ratings, and nutritional analysis.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: brand.logo_url ? [{
        url: brand.logo_url,
        width: 1200,
        height: 630,
        alt: `${brand.name} logo`
      }] : [],
      url: `${BASE_URL}/brands/${brand.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: brand.logo_url ? [brand.logo_url] : [],
    },
    alternates: {
      canonical: `/brands/${brand.slug}`,
    },
  };
}

/**
 * Create metadata for a comparison page
 */
export function createComparisonMetadata(products: Product[]): Metadata {
  if (products.length === 0) {
    return {
      title: 'Compare Dog Foods - Side-by-Side Analysis',
      description: 'Compare up to 3 dog food products side-by-side with detailed nutritional analysis, pricing, and ratings.',
      openGraph: {
        title: 'Compare Dog Foods',
        description: 'Compare up to 3 dog food products side-by-side with detailed nutritional analysis.',
        url: `${BASE_URL}/compare`,
      },
    };
  }

  const productNames = products.map(p => p.name).join(' vs ');
  const winner = products.reduce((best, current) =>
    (current.overall_score || 0) > (best.overall_score || 0) ? current : best
  );

  const title = `Compare: ${productNames} | Dog Food Comparison`;
  const description = `${productNames} comparison: ${winner.name} leads with ${Math.round(winner.overall_score || 0)}/100 score. See detailed nutritional analysis, ingredients, and pricing.`;

  return {
    title,
    description,
    openGraph: {
      title: `Compare: ${productNames}`,
      description,
      images: products.map(p => ({ url: p.image_url || '' })).filter(img => img.url),
      url: `${BASE_URL}/compare?products=${products.map(p => p.slug).join(',')}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

/**
 * Create metadata for a listing page
 */
export function createListingMetadata(params: {
  title: string;
  description: string;
  canonicalPath: string;
  image?: string;
}): Metadata {
  const { title, description, canonicalPath, image } = params;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}${canonicalPath}`,
      ...(image && {
        images: [{ url: image, width: 1200, height: 630 }],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(image && { images: [image] }),
    },
    alternates: {
      canonical: canonicalPath,
    },
  };
}

/**
 * Helper to generate description from product data
 */
export function generateProductDescription(product: Product): string {
  if (product.meta_description) return product.meta_description;

  const parts = [
    `${product.name} by ${product.brand?.name || 'Unknown'}`,
    product.overall_score ? `Score: ${Math.round(product.overall_score)}/100` : null,
    product.price_gbp ? `Price: £${product.price_gbp.toFixed(2)}` : null,
    product.category ? `Category: ${product.category}` : null,
  ].filter(Boolean);

  return parts.join(' • ');
}
