import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/layout/Container';
import { ProductDetail } from '@/components/features/ProductDetail';
import { getSupabase } from '@/lib/supabase';
import { Product } from '@/types';
import { PageSEO, ProductStructuredData } from '@/components/seo';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = getSupabase();

  const { data: product } = await supabase
    .from('products')
    .select('*, brand:brands(*), tags:product_tags(tag:tags(*))')
    .eq('slug', slug)
    .single();

  const typedProduct = product ? {
    ...(product as any),
    tags: (product as any).tags?.map((pt: any) => pt.tag) || []
  } as Product : null;

  if (!typedProduct) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: `${typedProduct.name} by ${typedProduct.brand?.name} - Review & Rating`,
    description: typedProduct.meta_description || `Detailed review, nutritional analysis, and rating for ${typedProduct.name}. Score: ${typedProduct.overall_score}/100. Compare prices and read ingredient breakdown.`,
    openGraph: {
      images: typedProduct.image_url ? [typedProduct.image_url] : [],
    },
  };
}

// Enable ISR with 1 hour revalidation
export const revalidate = 3600;

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const supabase = getSupabase();

  const { data: product } = await supabase
    .from('products')
    .select('*, brand:brands(*), tags:product_tags(tag:tags(*))')
    .eq('slug', slug)
    .eq('is_available', true)
    .single();

  const typedProduct = product ? {
    ...(product as any),
    tags: (product as any).tags?.map((pt: any) => pt.tag) || []
  } as Product : null;

  if (!typedProduct) {
    notFound();
  }

  // Fetch related products
  const { data: relatedProductsData } = await supabase
    .from('products')
    .select('*, brand:brands(*), tags:product_tags(tag:tags(*))')
    .eq('is_available', true)
    .neq('id', typedProduct.id)
    .or(`brand_id.eq.${typedProduct.brand_id},category.eq.${typedProduct.category}`)
    .order('overall_score', { ascending: false, nullsFirst: false })
    .limit(4);

  const relatedProducts = relatedProductsData ? relatedProductsData.map(product => ({
    ...(product as any),
    tags: (product as any).tags?.map((pt: any) => pt.tag) || []
  })) as Product[] : [];

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Dog Food', url: '/dog-food' },
    { name: typedProduct.brand?.name || 'Brand', url: `/brands/${typedProduct.brand?.slug}` },
    { name: typedProduct.name, url: `/dog-food/${typedProduct.slug}` },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <PageSEO
          title={`${typedProduct.name} by ${typedProduct.brand?.name} - Review & Rating`}
          description={typedProduct.meta_description || `Detailed review, nutritional analysis, and rating for ${typedProduct.name}. Score: ${typedProduct.overall_score}/100. Compare prices and read ingredient breakdown.`}
          canonicalUrl={`/dog-food/${typedProduct.slug}`}
          ogImage={typedProduct.image_url || '/og-default.jpg'}
          breadcrumbs={breadcrumbs}
          structuredData={[
            {
              type: 'Product',
              data: {
                name: typedProduct.name,
                description: typedProduct.meta_description || typedProduct.ingredients_raw?.substring(0, 160),
                brand: {
                  "@type": "Brand",
                  name: typedProduct.brand?.name,
                },
                category: typedProduct.category,
                offers: {
                  "@type": "Offer",
                  price: typedProduct.price_gbp,
                  priceCurrency: "GBP",
                  availability: typedProduct.is_available
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock",
                },
                aggregateRating: typedProduct.overall_score ? {
                  "@type": "AggregateRating",
                  ratingValue: typedProduct.overall_score,
                  bestRating: 100,
                  reviewCount: 1,
                } : undefined,
                image: typedProduct.image_url,
              },
            },
          ]}
        />
        <ProductDetail product={typedProduct} relatedProducts={relatedProducts || []} />
      </main>
      <Footer />
    </div>
  );
}
