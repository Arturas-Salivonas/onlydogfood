import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { ScoreDisplay } from '@/components/ui/ScoreDisplay';
import { FoodCard } from '@/components/ui/FoodCard';
import { FoodSummaryPanel } from '@/components/ui/FoodSummaryPanel';
import { ScoreBreakdownChart } from '@/components/ui/ScoreBreakdownChart';
import { NutritionTable } from '@/components/ui/NutritionTable';
import { IngredientBreakdown } from '@/components/ui/IngredientBreakdown';
import { PricePerFeed } from '@/components/ui/PricePerFeed';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils/format';
import { ExternalLink, Award, DollarSign, Package, TrendingUp, AlertCircle, Info, Shield, ChevronRight, Star } from 'lucide-react';

interface ProductDetailProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  // Prepare breadcrumbs
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Dog Food', href: '/dog-food' },
    { label: product.name, href: '#' }
  ];

  // Prepare subcategories for display
  const getSubCategories = () => {
    if (!product.sub_category) return [];
    try {
      const subCategories = typeof product.sub_category === 'string'
        ? JSON.parse(product.sub_category)
        : product.sub_category;
      return Array.isArray(subCategories) ? subCategories : [product.sub_category];
    } catch {
      return [product.sub_category];
    }
  };

  const subCategories = getSubCategories();

  return (
    <>


      {/* Hero Banner */}
      <div className="relative   text-foreground overflow-hidden">
        <Container className="relative pt-32 pb-16">
                    {/* Breadcrumbs */}
      <div className="flex items-center pb-8 justify-center gap-2 text-sm mb-6 flex-wrap font-mono">
        <Container>
          <div className=" text-sm justify-center flex items-center gap-2">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-2">
                {index > 0 && <ChevronRight size={16} className="text-text-secondary" />}
                {index === breadcrumbs.length - 1 ? (
                  <span className="font-semibold text-foreground">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="hover:text-secondary font-medium transition-colors text-foreground">
                    {crumb.label}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </Container>
      </div>
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Left Column - Image */}

            <div className="relative">
              <div className="relative aspect-[4/3] max-w-sm mx-auto  overflow-hidden ">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-contain"
                    priority
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-6xl">🐕</span>
                  </div>
                )}

                {/* Sponsored Badge */}
                {product.is_sponsored && (
                  <div className="absolute top-4 left-4 bg-accent text-surface text-sm font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                    <Award size={16} />
                    SPONSORED
                  </div>
                )}

                {/* Discount Code Overlay */}
                {product.discount_code && (
                  <div className="absolute bottom-0 left-0 right-0 bg-surface/95 backdrop-blur p-4 border-t border-primary-light">
                    <div className="text-foreground">
                      <p className="text-sm font-bold mb-1 text-accent">DISCOUNT CODE</p>
                      <p className="text-xl font-black tracking-wider text-secondary">{product.discount_code}</p>
                      {product.discount_description && (
                        <p className="text-xs mt-1 text-text-secondary">{product.discount_description}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">

              {/* Brand */}
              <Link
                href={`/brands/${product.brand?.slug}`}
                className="inline-flex items-center gap-2 text-foreground hover:text-secondary font-bold hover:underline transition-colors"
              >
                {product.brand?.name}
                <ExternalLink size={16} />
              </Link>

              {/* Product Name */}
              <h1 className="text-4xl lg:text-6xl font-black leading-tight text-foreground">{product.name}</h1>

              {/* Categories & Subcategories */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary/20 backdrop-blur text-foreground rounded-full text-sm font-bold capitalize border border-secondary/30">
                  {product.category}
                </span>
                {subCategories.map((cat, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/30 backdrop-blur text-foreground rounded-full text-sm font-bold capitalize border border-primary/40">
                    {cat}
                  </span>
                ))}
                {product.tags && product.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold backdrop-blur border"
                    style={{
                      background: `${tag.color}30`,
                      color: 'var(--foreground)',
                      borderColor: `${tag.color}50`
                    }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>

              {/* Score & Key Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-surface/80 backdrop-blur rounded-2xl p-4 text-center border border-primary-light shadow-sm">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="text-2xl font-bold text-foreground">{product.overall_score?.toFixed(1) || 'N/A'}</span>
                  </div>
                  <div className="text-xs text-text-secondary">Overall Score</div>
                </div>
                {product.price_gbp && (
                  <div className="bg-surface/80 backdrop-blur rounded-2xl p-4 text-center border border-primary-light shadow-sm">
                    <div className="text-2xl font-bold mb-1 text-foreground">{formatPrice(product.price_gbp)}</div>
                    <div className="text-xs text-text-secondary">Package Price</div>
                  </div>
                )}
                {product.price_per_kg_gbp && (
                  <div className="bg-surface/80 backdrop-blur rounded-2xl p-4 text-center border border-primary-light shadow-sm">
                    <div className="text-2xl font-bold mb-1 text-foreground">{formatPrice((product.price_per_kg_gbp * 0.15))}</div>
                    <div className="text-xs text-text-secondary">Per Meal (150g)</div>
                  </div>
                )}
                {product.package_size_g && (
                  <div className="bg-surface/80 backdrop-blur rounded-2xl p-4 text-center border border-primary-light shadow-sm">
                    <div className="text-2xl font-bold mb-1 text-foreground">{(product.package_size_g / 1000).toFixed(1)}kg</div>
                    <div className="text-xs text-text-secondary">Package Size</div>
                  </div>
                )}
              </div>

              {/* Buy Button */}
              {product.affiliate_url && (
                <div className="pt-4">
                  <a
                    href={product.affiliate_url}
                    target="_blank"
                    rel="noopener sponsored"
                    className="inline-flex items-center gap-3 bg-primary text-foreground hover:bg-primary-hover font-black text-lg py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl  border border-primary-hover"
                  >
                    BUY NOW <ExternalLink size={20} />
                  </a>
                  <p className="text-xs text-text-secondary mt-2">
                    💡 We may earn a commission from qualifying purchases
                  </p>
                </div>
              )}
            </div>
          </div>
        </Container>
      </div>

      {/* Content Sections */}
      <div className="bg-neutral">
        <Container className="py-12 space-y-12">
          {/* Algorithm Transparency */}
          <div className="bg-surface rounded-2xl p-6 shadow-sm border border-primary-light">
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-bold text-foreground">ALGORITHM v2.0.0</span>
                  <span className="text-sm text-text-secondary">•</span>
                  <span className="text-sm text-text-secondary">Updated Dec 2025</span>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  We score dog food based on ingredient quality, nutrition, and value for money. Penalties are applied for poor processing or additives.
                  <Link href="/how-we-score" className="text-secondary hover:text-secondary-hover font-semibold ml-1">
                    Learn more →
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="bg-surface rounded-2xl p-6 shadow-sm border border-primary-light">
            <h2 className="text-2xl font-bold text-foreground mb-6">Score Breakdown</h2>
            <ScoreBreakdownChart product={product} />
          </div>

          {/* Nutritional Information */}
          <div className="bg-surface rounded-2xl p-6 shadow-sm border border-primary-light">
            <h2 className="text-2xl font-bold text-foreground mb-6">Nutritional Information</h2>
            <NutritionTable product={product} />
          </div>

          {/* Ingredients */}
          {product.ingredients_list && product.ingredients_list.length > 0 && (
            <div className="bg-surface rounded-2xl p-6 shadow-sm border border-primary-light">
              <h2 className="text-2xl font-bold text-foreground mb-6">Ingredients</h2>
              <IngredientBreakdown product={product} defaultExpanded={true} />
            </div>
          )}

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="bg-surface rounded-2xl p-6 shadow-sm border border-primary-light">
              <h2 className="text-2xl font-bold text-foreground mb-6">You Might Also Like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <FoodCard key={relatedProduct.id} product={relatedProduct} showComparison={false} />
                ))}
              </div>
            </div>
          )}
        </Container>
      </div>
    </>
  );
}
