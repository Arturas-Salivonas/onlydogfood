import { StructuredData, createStructuredData, SCHEMA_TYPES } from './StructuredData';

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQStructuredDataProps {
  faqs: FAQItem[];
}

/**
 * Structured data component for FAQ pages.
 * Follows Google's FAQ schema guidelines for rich snippets.
 */
export function FAQStructuredData({ faqs }: FAQStructuredDataProps) {
  const structuredData = createStructuredData({
    "@type": SCHEMA_TYPES.FAQ_PAGE,
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  });

  return <StructuredData data={structuredData} />;
}

// Helper function to create FAQ data
export function createFAQData(question: string, answer: string): FAQItem {
  return { question, answer };
}

// Pre-defined common FAQ items for dog food
export const commonDogFoodFAQs = [
  createFAQData(
    "How do you rate dog food?",
    "We rate dog food based on nutritional analysis, ingredient quality, brand transparency, and customer reviews. Our scoring system evaluates protein quality, fat content, fiber levels, and absence of fillers or artificial additives."
  ),
  createFAQData(
    "What's the difference between dry, wet, and raw dog food?",
    "Dry dog food (kibble) is convenient and helps with dental health. Wet food has higher moisture content and is often more palatable. Raw food mimics ancestral diets but requires careful handling. The best choice depends on your dog's age, health, and preferences."
  ),
  createFAQData(
    "How often should I change my dog's food?",
    "Gradually transition over 7-10 days when changing foods. For adult dogs, you can stick with the same high-quality food long-term unless health issues arise. Puppies and seniors may need different formulations at different life stages."
  ),
  createFAQData(
    "Are grain-free dog foods better?",
    "Not necessarily. Some dogs benefit from grain-free diets due to allergies, but grains like rice and oats can be healthy carbohydrate sources. The quality of ingredients matters more than grain content. Consult your vet for allergy concerns."
  ),
];