import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageHero } from '@/components/layout/PageHero';
import { Container } from '@/components/layout/Container';
import { FoodCard } from '@/components/ui/FoodCard';
import { ScoreDisplay } from '@/components/ui/ScoreDisplay';
import { getSupabase } from '@/lib/supabase';
import { Brand, Product } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { PageSEO, BrandStructuredData } from '@/components/seo';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ category?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = getSupabase();

  const { data: brand } = await supabase
    .from('brands')
    .select('*')
    .eq('slug', slug)
    .single();

  const typedBrand = brand as unknown as Brand;

  if (!typedBrand) {
    return {
      title: 'Brand Not Found',
    };
  }

  return {
    title: `${typedBrand.name} Dog Food - Brand Review & Products`,
    description: typedBrand.meta_description || `Complete ${typedBrand.name} dog food brand review. Browse all products, ratings, and detailed nutritional analysis. Score: ${typedBrand.overall_score}/100.`,
    openGraph: {
      images: typedBrand.logo_url ? [typedBrand.logo_url] : [],
    },
  };
}

// Enable ISR with 1 hour revalidation
export const revalidate = 3600;

export default async function BrandPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { category } = await searchParams;
  const supabase = getSupabase();

  const { data: brand } = await supabase
    .from('brands')
    .select('*')
    .eq('slug', slug)
    .single();

  const typedBrand = brand as unknown as Brand;

  if (!typedBrand) {
    notFound();
  }

  // Fetch brand products
  let productsQuery = supabase
    .from('products')
    .select('*, brand:brands(*)')
    .eq('brand_id', typedBrand.id)
    .eq('is_available', true)
    .order('overall_score', { ascending: false, nullsFirst: false });

  if (category && category !== 'all') {
    productsQuery = productsQuery.eq('category', category);
  }

  const { data: products } = await productsQuery;

  const typedProducts = products as unknown as Product[];

  // Get category counts
  const { data: categoryCounts } = await supabase
    .from('products')
    .select('category')
    .eq('brand_id', typedBrand.id)
    .eq('is_available', true);

  const typedCategoryCounts = categoryCounts as unknown as Array<{ category: string }>;

  const counts = {
    all: typedCategoryCounts?.length || 0,
    dry: typedCategoryCounts?.filter(p => p.category === 'dry').length || 0,
    wet: typedCategoryCounts?.filter(p => p.category === 'wet').length || 0,
    snack: typedCategoryCounts?.filter(p => p.category === 'snack').length || 0,
  };

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Brands', url: '/brands' },
    { name: typedBrand.name, url: `/brands/${typedBrand.slug}` },
  ];

  // Prepare brand products for structured data
  const brandProducts = typedProducts?.slice(0, 10).map(product => ({
    id: product.id,
    name: product.name,
    price_gbp: product.price_gbp,
    overall_score: product.overall_score,
    image_url: product.image_url,
  })) || [];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <PageSEO
        title={`${typedBrand.name} Dog Food - Brand Review & Products`}
        description={typedBrand.meta_description || `Complete ${typedBrand.name} dog food brand review. Browse all products, ratings, and detailed nutritional analysis. Score: ${typedBrand.overall_score}/100.`}
        canonicalUrl={`/brands/${typedBrand.slug}`}
        ogImage={typedBrand.logo_url || '/og-default.jpg'}
        breadcrumbs={breadcrumbs}
        structuredData={[
          {
            type: 'Brand',
            data: {
              name: typedBrand.name,
              description: typedBrand.description,
              url: typedBrand.website_url,
              logo: typedBrand.logo_url,
              aggregateRating: typedBrand.overall_score ? {
                "@type": "AggregateRating",
                ratingValue: typedBrand.overall_score,
                bestRating: 100,
                reviewCount: typedBrand.total_products,
              } : undefined,
              address: typedBrand.country_of_origin ? {
                "@type": "PostalAddress",
                addressCountry: typedBrand.country_of_origin,
              } : undefined,
              hasOfferCatalog: brandProducts.length > 0 ? {
                "@type": "OfferCatalog",
                name: `${typedBrand.name} Dog Food Products`,
                itemListElement: brandProducts.map((product, index) => ({
                  "@type": "Product",
                  position: index + 1,
                  name: product.name,
                  offers: {
                    "@type": "Offer",
                    price: product.price_gbp,
                    priceCurrency: "GBP",
                  },
                  aggregateRating: product.overall_score ? {
                    "@type": "AggregateRating",
                    ratingValue: product.overall_score,
                    bestRating: 100,
                  } : undefined,
                })),
              } : undefined,
            },
          },
        ]}
      />
      <PageHero        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Brands', href: '/brands' },
          { label: typedBrand.name, href: '' }
        ]}
        title={typedBrand.name}
        description={typedBrand.description || `Browse all ${typedBrand.name} dog food products and nutritional analysis`}
        stats={[
          { label: 'Average Score', value: typedBrand.overall_score ? String(Math.round(typedBrand.overall_score)) : 'N/A' },
          { label: 'Total Products', value: String(typedBrand.total_products || 0) },
          { label: 'Country', value: typedBrand.country_of_origin || 'International' }
        ]}
      />

      <main className="flex-1">
        {/* Brand Details Card */}
        <Container className="py-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
            <div className="grid md:grid-cols-4 gap-8 items-start">
              {/* Brand Logo */}
              <div className="flex items-center justify-center">
                {typedBrand.logo_url ? (
                  <div className="relative w-40 h-40 rounded-xl overflow-hidden bg-gray-50 p-4">
                    <Image
                      src={typedBrand.logo_url}
                      alt={typedBrand.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-40 h-40 bg-primary-light rounded-xl flex items-center justify-center">
                    <span className="text-7xl">🏷️</span>
                  </div>
                )}
              </div>

              {/* Brand Info */}
              <div className="md:col-span-3">
                {typedBrand.is_sponsored && (
                  <div className="inline-block bg-primary text-surface text-sm font-bold px-4 py-1.5 rounded-full mb-4 shadow-md">
                    ⭐ Sponsored Brand
                  </div>
                )}

                {/* Website Link */}
                {typedBrand.website_url && (
                  <a
                    href={typedBrand.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-xl  mb-6"
                  >
                    Visit Website <ExternalLink size={18} />
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Products from {typedBrand.name}</h2>

            {/* Category Filter */}
            <div className="flex gap-3 flex-wrap bg-white rounded-xl shadow-md p-4 border border-gray-200">
              <Link
                href={`/brands/${typedBrand.slug}`}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  !category || category === 'all'
                    ? 'bg-secondary text-surface shadow-md'
                    : 'bg-neutral text-foreground hover:bg-primary-light'
                }`}
              >
                ✨ All ({counts.all})
              </Link>
              {counts.dry > 0 && (
                <Link
                  href={`/brands/${typedBrand.slug}?category=dry`}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    category === 'dry'
                      ? 'bg-secondary text-surface shadow-md'
                      : 'bg-neutral text-foreground hover:bg-primary-light'
                  }`}
                >
                  🥘 Dry Food ({counts.dry})
                </Link>
              )}
              {counts.wet > 0 && (
                <Link
                  href={`/brands/${typedBrand.slug}?category=wet`}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    category === 'wet'
                      ? 'bg-secondary text-surface shadow-md'
                      : 'bg-neutral text-foreground hover:bg-primary-light'
                  }`}
                >
                  🥫 Wet Food ({counts.wet})
                </Link>
              )}
              {counts.snack > 0 && (
                <Link
                  href={`/brands/${typedBrand.slug}?category=snack`}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    category === 'snack'
                      ? 'bg-secondary text-surface shadow-md'
                      : 'bg-neutral text-foreground hover:bg-primary-light'
                  }`}
                >
                  🦴 Snacks ({counts.snack})
                </Link>
              )}
            </div>
          </div>

          {/* Products Grid */}
          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {typedProducts.map((product) => (
                <FoodCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-neutral rounded-2xl border-2 border-dashed border-primary-light">
              <span className="text-8xl mb-6 block">📦</span>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No products found
              </h3>
              <p className="text-gray-600 text-lg">Try selecting a different category</p>
            </div>
          )}
        </Container>
      </main>

      <Footer />
    </div>
  );
}
