import { ReactNode } from 'react';

interface StructuredDataProps {
  data: Record<string, any>;
  children?: ReactNode;
}

/**
 * Generic component for rendering structured data (JSON-LD) in the document head.
 * This component is reusable across all page types and can handle any schema.org structured data.
 *
 * @param data - The structured data object to render as JSON-LD
 * @param children - Optional additional content to render alongside the structured data
 */
export function StructuredData({ data, children }: StructuredDataProps) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
      {children}
    </>
  );
}

// Helper function to create structured data with consistent @context
export function createStructuredData(data: Record<string, any>) {
  return {
    "@context": "https://schema.org",
    ...data,
  };
}

// Common schema types for easy reference
export const SCHEMA_TYPES = {
  PRODUCT: 'Product',
  BRAND: 'Brand',
  ORGANIZATION: 'Organization',
  BREADCRUMB_LIST: 'BreadcrumbList',
  FAQ_PAGE: 'FAQPage',
  ARTICLE: 'Article',
  WEB_PAGE: 'WebPage',
  SEARCH_RESULTS_PAGE: 'SearchResultsPage',
  COLLECTION_PAGE: 'CollectionPage',
  ITEM_LIST: 'ItemList',
} as const;

export type SchemaType = typeof SCHEMA_TYPES[keyof typeof SCHEMA_TYPES];



