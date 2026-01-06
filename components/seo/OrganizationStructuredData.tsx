interface OrganizationStructuredDataProps {
  url?: string;
  logo?: string;
}

export function OrganizationStructuredData({
  url = "https://onlydogfood.com",
  logo = "/logo.png"
}: OrganizationStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "OnlyDogFood",
    "url": url,
    "logo": logo,
    "description": "Science-backed dog food reviews and comparisons. Find the best dog food for your pet with detailed nutritional analysis and expert ratings.",
    "sameAs": [
      // Add social media URLs when available
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": "English",
    },
    "foundingDate": "2024",
    "knowsAbout": [
      "Dog Food",
      "Pet Nutrition",
      "Dog Health",
      "Pet Food Reviews",
      "Nutritional Analysis"
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}



