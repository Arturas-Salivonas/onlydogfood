import { StructuredData, createStructuredData, SCHEMA_TYPES } from './StructuredData';

interface ArticleStructuredDataProps {
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  author: {
    name: string;
    url?: string;
  };
  publisher: {
    name: string;
    logo: string;
  };
  image?: string;
  keywords?: string[];
  articleSection?: string;
}

/**
 * Structured data component for article/blog pages.
 * Follows Google's Article schema guidelines for rich snippets.
 */
export function ArticleStructuredData({
  headline,
  description,
  url,
  datePublished,
  dateModified,
  author,
  publisher,
  image,
  keywords,
  articleSection,
}: ArticleStructuredDataProps) {
  const structuredData = createStructuredData({
    "@type": SCHEMA_TYPES.ARTICLE,
    "headline": headline,
    "description": description,
    "url": url,
    "datePublished": datePublished,
    "dateModified": dateModified || datePublished,
    "author": {
      "@type": "Person",
      "name": author.name,
      ...(author.url && { "url": author.url }),
    },
    "publisher": {
      "@type": "Organization",
      "name": publisher.name,
      "logo": {
        "@type": "ImageObject",
        "url": publisher.logo,
      },
    },
    ...(image && {
      "image": {
        "@type": "ImageObject",
        "url": image,
      },
    }),
    ...(keywords && { "keywords": keywords.join(", ") }),
    ...(articleSection && { "articleSection": articleSection }),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url,
    },
  });

  return <StructuredData data={structuredData} />;
}

// Helper function to create article data
export function createArticleData(
  headline: string,
  description: string,
  url: string,
  datePublished: string,
  authorName: string,
  options: Partial<Omit<ArticleStructuredDataProps, 'headline' | 'description' | 'url' | 'datePublished' | 'author' | 'publisher'>> = {}
): Omit<ArticleStructuredDataProps, 'publisher'> & { author: { name: string; url?: string } } {
  return {
    headline,
    description,
    url,
    datePublished,
    author: { name: authorName },
    ...options,
  };
}