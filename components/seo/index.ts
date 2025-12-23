// SEO Components - Comprehensive structured data and metadata management

// Core components
export { StructuredData, createStructuredData, SCHEMA_TYPES } from './StructuredData';
export type { SchemaType } from './StructuredData';

// Page-level SEO component
export { PageSEO, generatePageMetadata } from './PageSEO';

// Specific structured data components
export { ProductStructuredData } from './ProductStructuredData';
export { BrandStructuredData } from './BrandStructuredData';
export { OrganizationStructuredData } from './OrganizationStructuredData';
export { WebSiteStructuredData } from './WebSiteStructuredData';
export { BreadcrumbStructuredData } from './BreadcrumbStructuredData';
export { FAQStructuredData, createFAQData, commonDogFoodFAQs } from './FAQStructuredData';
export { CollectionPageStructuredData, createCollectionItem } from './CollectionPageStructuredData';
export { ArticleStructuredData, createArticleData } from './ArticleStructuredData';

// Re-export types for convenience
export type { BreadcrumbItem } from './BreadcrumbStructuredData';
export type { FAQItem } from './FAQStructuredData';
export type { CollectionItem } from './CollectionPageStructuredData';