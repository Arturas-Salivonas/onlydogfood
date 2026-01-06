interface WebSiteStructuredDataProps {
  url?: string;
  searchUrl?: string;
}

export function WebSiteStructuredData({
  url = "https://onlydogfood.com",
  searchUrl = "https://onlydogfood.com/search?q={search_term_string}"
}: WebSiteStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "OnlyDogFood",
    "url": url,
    "description": "Science-backed dog food reviews and comparisons. Find the best dog food for your pet with detailed nutritional analysis and expert ratings.",
    "publisher": {
      "@type": "Organization",
      "name": "OnlyDogFood",
      "url": url,
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": searchUrl,
      },
      "query-input": "required name=search_term_string",
    },
    "inLanguage": "en-GB",
    "copyrightHolder": {
      "@type": "Organization",
      "name": "OnlyDogFood",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}



