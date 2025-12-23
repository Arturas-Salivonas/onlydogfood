import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { ScoreDisplay } from '@/components/ui/ScoreDisplay';
import { ProductCard } from '@/components/ui/ProductCard';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils/format';
import { ExternalLink, Award, DollarSign, Package, TrendingUp, AlertCircle } from 'lucide-react';

interface ProductDetailProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  return (
    <>
      {/* Breadcrumbs */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
        <Container>
          <div className="py-4 text-sm flex items-center gap-2">
            <Link href="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Home</Link>
            <span className="text-gray-400">/</span>
            <Link href="/dog-food" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Dog Food</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-semibold">{product.name}</span>
          </div>
        </Container>
      </div>

      {/* Main Content */}
      <div className="bg-gradient-to-b from-white to-gray-50">
        <Container className="py-12">
          {/* Hero Section */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden mb-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column - Image */}
              <div className="relative">
                {product.is_sponsored && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white text-sm font-bold px-6 py-3 z-10 flex items-center justify-center gap-2 shadow-lg">
                    <Award size={20} />
                    SPONSORED PRODUCT
                  </div>
                )}

                <div className={`relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 ${product.is_sponsored ? 'mt-12' : ''}`}>
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-9xl">🐕</span>
                    </div>
                  )}
                </div>

                {/* Discount Code */}
                {product.discount_code && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 shadow-2xl">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">💰</div>
                      <div className="flex-1">
                        <p className="text-sm font-bold mb-1">EXCLUSIVE DISCOUNT CODE</p>
                        <p className="text-3xl font-black tracking-wider">{product.discount_code}</p>
                        {product.discount_description && (
                          <p className="text-sm mt-1 text-green-100">{product.discount_description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Details */}
              <div className="p-8 lg:p-12">
                {/* Brand */}
                <Link
                  href={`/brands/${product.brand?.slug}`}
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold mb-3 hover:underline transition-colors"
                >
                  {product.brand?.name}
                  <ExternalLink size={16} />
                </Link>

                {/* Product Name */}
                <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 leading-tight">{product.name}</h1>

                {/* Category & Tags */}
                <div className="flex flex-wrap gap-2 mb-8">
                  <span className="inline-flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl text-sm font-bold capitalize shadow-sm">
                    {product.category}
                  </span>
                  {product.sub_category && (() => {
                    try {
                      // Try to parse as JSON array
                      const subCategories = typeof product.sub_category === 'string'
                        ? JSON.parse(product.sub_category)
                        : product.sub_category;

                      if (Array.isArray(subCategories)) {
                        return subCategories.map((cat, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-xl text-sm font-bold capitalize shadow-sm">
                            {cat}
                          </span>
                        ));
                      }
                      // If not array, display as single badge
                      return (
                        <span className="inline-flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-xl text-sm font-bold capitalize shadow-sm">
                          {product.sub_category}
                        </span>
                      );
                    } catch {
                      // If parsing fails, display as is
                      return (
                        <span className="inline-flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-xl text-sm font-bold capitalize shadow-sm">
                          {product.sub_category}
                        </span>
                      );
                    }
                  })()}
                  {product.tags && product.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-bold shadow-sm"
                      style={{
                        background: `linear-gradient(to right, ${tag.color}20, ${tag.color}40)`,
                        color: tag.color,
                        border: `1px solid ${tag.color}30`
                      }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>

                {/* Overall Score - HERO */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 mb-8 shadow-2xl text-white">
                  <div className="flex items-center gap-8">
                    <div className="flex-shrink-0">
                      <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center shadow-xl">
                        <span className="text-6xl font-black bg-gradient-to-br from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                          {Math.round(product.overall_score || 0)}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-3xl font-black mb-2">Overall Score</h2>
                      <p className="text-blue-100 text-lg">
                        Based on ingredients, nutrition, and value
                      </p>
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  <div className="mt-8 pt-8 border-t border-white/20">
                    <h3 className="font-bold text-lg mb-4">Score Breakdown</h3>
                    <div className="space-y-3">
                      <ScoreBar
                        label="Ingredient Quality"
                        score={product.ingredient_score || 0}
                        max={45}
                        color="bg-white"
                        textColor="text-white"
                      />
                      <ScoreBar
                        label="Nutritional Value"
                        score={product.nutrition_score || 0}
                        max={33}
                        color="bg-white"
                        textColor="text-white"
                      />
                      <ScoreBar
                        label="Value for Money"
                        score={product.value_score || 0}
                        max={22}
                        color="bg-white"
                        textColor="text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Price & Size */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {product.price_gbp && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                      <div className="flex items-center gap-2 mb-2">

                        <p className="text-sm font-bold text-green-700 uppercase tracking-wider">Package Price</p>
                      </div>
                      <p className="text-4xl font-black text-green-700">{formatPrice(product.price_gbp)}</p>
                    </div>
                  )}
                  {product.price_per_kg_gbp && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
                      <div className="flex items-center gap-2 mb-2">

                        <p className="text-sm font-bold text-blue-700 uppercase tracking-wider">Price per Meal</p>
                      </div>
                      <p className="text-4xl font-black text-blue-700">{formatPrice((product.price_per_kg_gbp * 0.15))}</p>
                      <p className="text-sm text-blue-600 mt-1">Based on 150g serving</p>
                    </div>
                  )}
                </div>

                {product.package_size_g && (
                  <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <Package size={24} className="text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">Package Size</p>
                        <p className="text-2xl font-bold text-gray-900">{(product.package_size_g / 1000).toFixed(1)}kg</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Buy Button */}
                {product.affiliate_url && (
                  <a
                    href={product.affiliate_url}
                    target="_blank"
                    rel="noopener sponsored"
                    className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-lg py-6 px-8 rounded-2xl text-center transition-all shadow-xl hover:shadow-2xl hover:scale-105 mb-4"
                  >
                    <span className="flex items-center justify-center gap-3">
                      BUY NOW <ExternalLink size={24} />
                    </span>
                  </a>
                )}

                <p className="text-xs text-gray-500 text-center">
                  💡 Affiliate Disclosure: We may earn a commission from qualifying purchases
                </p>
              </div>
            </div>
          </div>

          {/* Nutritional Information */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Left: Guaranteed Analysis */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">🥩</span>
                </div>
                <h2 className="text-2xl font-black text-gray-900">Guaranteed Analysis</h2>
              </div>
              <div className="space-y-4">
                {product.protein_percent ? (
                  <NutritionRow label="Protein" value={`${product.protein_percent}%`} highlight />
                ) : (
                  <NutritionRow label="Protein" value="Not specified" />
                )}
                {product.fat_percent ? (
                  <NutritionRow label="Fat" value={`${product.fat_percent}%`} />
                ) : (
                  <NutritionRow label="Fat" value="Not specified" />
                )}
                {product.fiber_percent ? (
                  <NutritionRow label="Fiber" value={`${product.fiber_percent}%`} />
                ) : (
                  <NutritionRow label="Fiber" value="Not specified" />
                )}
                {product.moisture_percent ? (
                  <NutritionRow label="Moisture" value={`${product.moisture_percent}%`} />
                ) : (
                  <NutritionRow label="Moisture" value="Not specified" />
                )}
                {product.ash_percent ? (
                  <NutritionRow label="Ash" value={`${product.ash_percent}%`} />
                ) : (
                  <NutritionRow label="Ash" value="Not specified" />
                )}
                {product.carbs_percent ? (
                  <NutritionRow label="Carbohydrates" value={`${product.carbs_percent.toFixed(1)}%`} />
                ) : (
                  <NutritionRow label="Carbohydrates" value="Not calculated" />
                )}
              </div>
            </div>

            {/* Right: Additional Info */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <h2 className="text-2xl font-black text-gray-900">Additional Info</h2>
              </div>
              <div className="space-y-4">
                {product.calories_per_100g ? (
                  <NutritionRow label="Calories (per 100g)" value={`${product.calories_per_100g} kcal`} />
                ) : (
                  <NutritionRow label="Calories (per 100g)" value="Not specified" />
                )}
                {product.meat_content_percent ? (
                  <NutritionRow label="Meat Content" value={`${product.meat_content_percent}%`} highlight />
                ) : (
                  <NutritionRow label="Meat Content" value="Not specified" />
                )}
              </div>
            </div>
          </div>

          {/* Ingredients Section */}
          {product.ingredients_raw && (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">

                <h2 className="text-2xl font-black text-gray-900">Ingredients</h2>
              </div>

              {/* Parsed Ingredients List */}
              {product.ingredients_list && product.ingredients_list.length > 0 ? (
                <div className="mb-6">

                  <div className="flex flex-wrap gap-2">
                    {product.ingredients_list.map((ingredient, idx) => (
                      <span
                        key={idx}
                        className={`inline-flex items-center px-3 py-2 rounded-lg text-sm leading-text  ${
                          idx === 0
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200 border-2'
                            : idx === 1
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200 border-2'
                            : idx === 2
                            ? 'bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 border-orange-200 border-2'
                            : ' text-gray-700'
                        }`}
                      >
                        {idx < 3 && <span className="mr-1 font-black">#{idx + 1}</span>}
                        {ingredient}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-4 italic">
                    💡 Ingredients are listed in order of predominance by weight. The first 3 ingredients are highlighted.
                  </p>
                </div>
              ) : null}



            </div>
          )}

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-8">You Might Also Like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
              </div>
            </div>
          )}
        </Container>
      </div>
    </>
  );
}

function ScoreBar({
  label,
  score,
  max,
  color = 'bg-blue-600',
  textColor = 'text-gray-700'
}: {
  label: string;
  score: number;
  max: number;
  color?: string;
  textColor?: string;
}) {
  const percentage = (score / max) * 100;

  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className={textColor}>{label}</span>
        <span className={`font-bold ${textColor}`}>{score}/{max}</span>
      </div>
      <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
        <div
          className={`${color} h-3 rounded-full transition-all duration-500 shadow-lg`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function NutritionRow({
  label,
  value,
  highlight,
  icon
}: {
  label: string;
  value: string;
  highlight?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
      <span className="text-gray-600 font-semibold">{label}</span>
      <div className="flex items-center gap-2">
        {icon}
        <span className={`font-bold text-lg ${highlight ? 'text-green-600' : 'text-gray-900'}`}>
          {value}
        </span>
      </div>
    </div>
  );
}
