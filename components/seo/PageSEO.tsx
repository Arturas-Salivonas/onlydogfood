import { ReactNode } from 'react';
import { Metadata } from 'next';
import { StructuredData, createStructuredData, SCHEMA_TYPES } from './StructuredData';
import { OrganizationStructuredData } from './OrganizationStructuredData';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface PageSEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  structuredData?: Array<{
    type: string;
    data: Record<string, any>;
  }>;
  breadcrumbs?: BreadcrumbItem[];
  noindex?: boolean;
  children?: ReactNode;
}

/**
 * Comprehensive SEO component that handles metadata, structured data, and breadcrumbs.
 * This is the main reusable component for all page types.
 */
export function PageSEO({
  title,
  description,
  canonicalUrl,
  ogImage,
  structuredData = [],
  breadcrumbs,
  noindex = false,
  children,
}: PageSEOProps) {
  const baseUrl = 'https://onlydogfood.com';
  const fullCanonicalUrl = canonicalUrl ? `${baseUrl}${canonicalUrl}` : undefined;

  // Generate metadata object for Next.js
  const metadata: Metadata = {
    title,
    description,
    ...(noindex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
    ...(fullCanonicalUrl && {
      alternates: {
        canonical: fullCanonicalUrl,
      },
    }),
    openGraph: {
      title,
      description,
      url: fullCanonicalUrl,
      siteName: 'OnlyDogFood',
      ...(ogImage && {
        images: [
          {
            url: ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      }),
      locale: 'en_GB',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(ogImage && {
        images: [ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`],
      }),
    },
    other: {
      'article:author': 'OnlyDogFood',
    },
  };

  // Create breadcrumb structured data if provided
  const breadcrumbStructuredData = breadcrumbs ? createStructuredData({
    "@type": SCHEMA_TYPES.BREADCRUMB_LIST,
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
    })),
  }) : null;

  return (
    <>
      {/* Next.js metadata (handled by Next.js) */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {fullCanonicalUrl && <link rel="canonical" href={fullCanonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullCanonicalUrl || baseUrl} />
      <meta property="og:site_name" content="OnlyDogFood" />
      {ogImage && <meta property="og:image" content={ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`} />}
      <meta property="og:locale" content="en_GB" />
      <meta property="og:type" content="website" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`} />}

      {/* Structured Data */}
      <OrganizationStructuredData />

      {breadcrumbStructuredData && (
        <StructuredData data={breadcrumbStructuredData} />
      )}

      {structuredData.map((item, index) => (
        <StructuredData
          key={`${item.type}-${index}`}
          data={createStructuredData({ "@type": item.type, ...item.data })}
        />
      ))}

      {children}
    </>
  );
}

// Helper function to generate page metadata for Next.js App Router
export function generatePageMetadata({
  title,
  description,
  canonicalUrl,
  ogImage,
  noindex = false,
}: Omit<PageSEOProps, 'structuredData' | 'breadcrumbs' | 'children'>): Metadata {
  const baseUrl = 'https://onlydogfood.com';
  const fullCanonicalUrl = canonicalUrl ? `${baseUrl}${canonicalUrl}` : undefined;

  return {
    title,
    description,
    ...(noindex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
    ...(fullCanonicalUrl && {
      alternates: {
        canonical: fullCanonicalUrl,
      },
    }),
    openGraph: {
      title,
      description,
      url: fullCanonicalUrl,
      siteName: 'OnlyDogFood',
      ...(ogImage && {
        images: [
          {
            url: ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      }),
      locale: 'en_GB',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(ogImage && {
        images: [ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`],
      }),
    },
  };
}