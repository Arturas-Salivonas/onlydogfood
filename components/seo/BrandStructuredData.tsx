import { Brand } from '@/types';

interface BrandStructuredDataProps {
  brand: Brand;
  products?: Array<{
    id: string;
    name: string;
    price_gbp: number;
    overall_score: number;
    image_url: string | null;
  }>;
}

export function BrandStructuredData({ brand, products }: BrandStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Brand",
    "name": brand.name,
    "description": brand.description,
    "url": brand.website_url,
    "logo": brand.logo_url,
    "aggregateRating": brand.overall_score ? {
      "@type": "AggregateRating",
      "ratingValue": brand.overall_score,
      "bestRating": 100,
      "reviewCount": brand.total_products,
    } : undefined,
    "address": brand.country_of_origin ? {
      "@type": "PostalAddress",
      "addressCountry": brand.country_of_origin,
    } : undefined,
    "hasOfferCatalog": products ? {
      "@type": "OfferCatalog",
      "name": `${brand.name} Dog Food Products`,
      "itemListElement": products.map((product, index) => ({
        "@type": "Product",
        "position": index + 1,
        "name": product.name,
        "offers": {
          "@type": "Offer",
          "price": product.price_gbp,
          "priceCurrency": "GBP",
        },
        "aggregateRating": product.overall_score ? {
          "@type": "AggregateRating",
          "ratingValue": product.overall_score,
          "bestRating": 100,
        } : undefined,
      })),
    } : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}