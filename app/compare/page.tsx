import { Metadata } from 'next';
import { Product } from '@/types';
import { ComparePageClient } from '@/components/pages/ComparePageClient';
import { productQueries } from '@/lib/db/queries';
import { createComparisonMetadata } from '@/lib/seo/metadata';

interface Props {
  searchParams: Promise<{ products?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const productsParam = params.products;

  if (!productsParam) {
    return createComparisonMetadata([]);
  }

  const slugs = productsParam.split(',').filter(Boolean).slice(0, 3);

  if (slugs.length === 0) {
    return createComparisonMetadata([]);
  }

  try {
    const products = await productQueries.bySlugs(slugs);
    return createComparisonMetadata(products);
  } catch (error) {
    console.error('Error generating compare page metadata:', error);
    return createComparisonMetadata([]);
  }
}

export default async function ComparePage({ searchParams }: Props) {
  const params = await searchParams;
  const productsParam = params.products;

  let initialProducts: Product[] = [];

  // Fetch initial products if provided in URL
  if (productsParam) {
    const slugs = productsParam.split(',').filter(Boolean).slice(0, 3);

    if (slugs.length > 0) {
      try {
        initialProducts = await productQueries.bySlugs(slugs);
      } catch (error) {
        console.error('Error fetching initial products:', error);
      }
    }
  }

  return <ComparePageClient initialProducts={initialProducts} />;
}
