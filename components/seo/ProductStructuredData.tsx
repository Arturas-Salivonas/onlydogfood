import { Product } from '@/types';

interface ProductStructuredDataProps {
  product: Product;
}

export function ProductStructuredData({ product }: ProductStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.meta_description || product.ingredients_raw?.substring(0, 160),
    "brand": {
      "@type": "Brand",
      "name": product.brand?.name,
    },
    "category": product.category,
    "offers": {
      "@type": "Offer",
      "price": product.price_gbp,
      "priceCurrency": "GBP",
      "availability": product.is_available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    },
    "aggregateRating": product.overall_score ? {
      "@type": "AggregateRating",
      "ratingValue": product.overall_score,
      "bestRating": 100,
      "reviewCount": 1,
    } : undefined,
    "image": product.image_url,
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Protein",
        "value": product.protein_percent ? `${product.protein_percent}%` : "N/A"
      },
      {
        "@type": "PropertyValue",
        "name": "Fat",
        "value": product.fat_percent ? `${product.fat_percent}%` : "N/A"
      },
      {
        "@type": "PropertyValue",
        "name": "Fiber",
        "value": product.fiber_percent ? `${product.fiber_percent}%` : "N/A"
      }
    ].filter(prop => prop.value !== "N/A"),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}



