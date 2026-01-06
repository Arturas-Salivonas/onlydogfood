import { StructuredData, createStructuredData, SCHEMA_TYPES } from './StructuredData';

export interface CollectionItem {
  id: string;
  name: string;
  url: string;
  description?: string;
  image?: string;
  price?: number;
  rating?: number;
}

interface CollectionPageStructuredDataProps {
  name: string;
  description: string;
  url: string;
  items: CollectionItem[];
  totalItems?: number;
}

/**
 * Structured data component for collection/listing pages (categories, search results, etc.).
 * Helps search engines understand the page contains a list of items.
 */
export function CollectionPageStructuredData({
  name,
  description,
  url,
  items,
  totalItems,
}: CollectionPageStructuredDataProps) {
  const structuredData = createStructuredData({
    "@type": SCHEMA_TYPES.COLLECTION_PAGE,
    "name": name,
    "description": description,
    "url": url,
    "mainEntity": {
      "@type": SCHEMA_TYPES.ITEM_LIST,
      "name": name,
      "description": description,
      "numberOfItems": totalItems || items.length,
      "itemListElement": items.map((item, index) => ({
        "@type": "Product",
        "position": index + 1,
        "name": item.name,
        "url": item.url,
        "description": item.description,
        "image": item.image,
        "offers": item.price ? {
          "@type": "Offer",
          "price": item.price,
          "priceCurrency": "GBP",
        } : undefined,
        "aggregateRating": item.rating ? {
          "@type": "AggregateRating",
          "ratingValue": item.rating,
          "bestRating": 100,
        } : undefined,
      })),
    },
  });

  return <StructuredData data={structuredData} />;
}

// Helper function to create collection item data
export function createCollectionItem(
  id: string,
  name: string,
  url: string,
  options: Partial<Omit<CollectionItem, 'id' | 'name' | 'url'>> = {}
): CollectionItem {
  return {
    id,
    name,
    url,
    ...options,
  };
}



