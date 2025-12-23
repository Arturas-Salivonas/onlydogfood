'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { getScoreColor } from '@/scoring/calculator';
import { formatPrice } from '@/lib/utils/format';
import { useComparison } from '@/components/context/UIContext';
import { Check, Plus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  showComparison?: boolean;
  showTags?: boolean;
  showPricePerMeal?: boolean;
  ranking?: number;
  imageFit?: 'cover' | 'contain';
}

export function ProductCard({ 
  product, 
  showComparison = true, 
  showTags = true, 
  showPricePerMeal = true,
  ranking,
  imageFit = 'cover'
}: ProductCardProps) {
  const scoreInfo = getScoreColor(product.overall_score || 0);
  const { addItem, hasItem, canAddMore } = useComparison();
  const isInComparison = hasItem(product.id);

  const handleComparisonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isInComparison && canAddMore) {
      addItem(product.id);
    }
  };

  return (
    <div className="block h-full relative group">
      {/* Ranking Badge */}
      {ranking && (
        <div className="absolute top-3 left-3 z-20 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-lg w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
          #{ranking}
        </div>
      )}

      {/* Comparison Button */}
      {showComparison && (
        <button
          onClick={handleComparisonClick}
          disabled={isInComparison || !canAddMore}
          className={`absolute top-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
            isInComparison
              ? 'bg-green-500 text-white shadow-lg'
              : canAddMore
              ? 'bg-white/90 text-gray-600 hover:bg-white hover:text-blue-600 shadow-lg opacity-0 group-hover:opacity-100'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-0 group-hover:opacity-100'
          }`}
          title={
            isInComparison
              ? 'Already in comparison'
              : canAddMore
              ? 'Add to comparison'
              : 'Comparison full (max 4 items)'
          }
        >
          {isInComparison ? (
            <Check className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </button>
      )}

      <Link href={`/dog-food/${product.slug}`} className="block h-full">
      <div className="group h-full bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-300 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] relative">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/20 to-purple-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        {/* Sponsored Badge */}
        {product.is_sponsored && (
          <div className="relative z-10 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 text-white text-xs font-bold px-4 py-2 text-center shadow-lg shadow-amber-500/30 animate-pulse">
            ⭐ SPONSORED
          </div>
        )}

        {/* Product Image */}
        <div className="relative aspect-square bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className={`object-${imageFit} group-hover:scale-110 transition-transform duration-700 ease-out`}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-300">
              <span className="text-7xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">🐕</span>
            </div>
          )}
          {/* Image overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        {/* Product Info */}
        <div className="relative z-10 p-6">
          {/* Brand */}
          <p className="text-xs font-bold text-blue-600 mb-3 uppercase tracking-wider group-hover:text-blue-700 transition-colors">
            {product.brand?.name}
          </p>

          {/* Product Name */}
          <h3 className="font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-blue-700 transition-colors text-lg leading-tight">
            {product.name}
          </h3>

          {/* Tags and Profile Badges */}
          {showTags && (() => {
            const profileBadges: string[] = [];
            const regularTags = product.tags || [];

            // Extract profile badges from sub_category
            if (product.sub_category) {
              try {
                const subCategories = typeof product.sub_category === 'string'
                  ? JSON.parse(product.sub_category)
                  : product.sub_category;

                if (Array.isArray(subCategories)) {
                  profileBadges.push(...subCategories.filter(cat =>
                    ['Natural', 'Hypoallergenic', 'Certified'].includes(cat)
                  ));
                }
              } catch {
                // Ignore parsing errors
              }
            }

            const allTags = [...profileBadges, ...regularTags.map(tag => tag.name)].slice(0, 3);

            return allTags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {allTags.map((tagName, idx) => {
                  const isProfileBadge = ['Natural', 'Hypoallergenic', 'Certified'].includes(tagName);
                  const tag = regularTags.find(t => t.name === tagName);

                  let badgeStyle = {};

                  if (isProfileBadge) {
                    switch (tagName) {
                      case 'Natural':
                        badgeStyle = {
                          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                          color: 'white',
                          border: 'none',
                          boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
                        };
                        break;
                      case 'Hypoallergenic':
                        badgeStyle = {
                          background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                          color: 'white',
                          border: 'none',
                          boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)'
                        };
                        break;
                      case 'Certified':
                        badgeStyle = {
                          background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                          color: 'white',
                          border: 'none',
                          boxShadow: '0 2px 4px rgba(245, 158, 11, 0.2)'
                        };
                        break;
                    }
                  }

                  return (
                    <span
                      key={idx}
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm hover:shadow-md transition-shadow ${
                        isProfileBadge ? '' : 'hover:scale-105'
                      }`}
                      style={isProfileBadge ? badgeStyle : {
                        backgroundColor: `${tag?.color}15`,
                        color: tag?.color,
                        border: `1px solid ${tag?.color}25`
                      }}
                    >
                      {isProfileBadge && '✓'} {tagName}
                    </span>
                  );
                })}
              </div>
            ) : null;
          })()}

          {/* Score */}
          <div className="flex items-center gap-3 mb-5 p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-100/50 group-hover:shadow-lg transition-shadow">
            <div className={`flex items-center justify-center w-16 h-16 rounded-2xl ${scoreInfo.bgColor} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <span className={`font-bold text-xl ${scoreInfo.color}`}>
                {Math.round(product.overall_score || 0)}
              </span>
            </div>
            <div className="flex-1">
              <p className={`text-sm font-bold ${scoreInfo.color} group-hover:scale-105 transition-transform`}>
                {scoreInfo.label}
              </p>
              <p className="text-xs text-gray-500 font-medium">Overall Score</p>
            </div>
          </div>

          {/* Price per Meal */}
          {showPricePerMeal && product.price_per_kg_gbp && (
            <div className="mb-5 p-4 bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 rounded-xl border border-emerald-200/50 shadow-sm group-hover:shadow-lg transition-shadow">
              <p className="text-xs font-bold text-emerald-800 mb-3 flex items-center gap-1.5">
                <span className="text-base">💰</span>
                Price per Meal
              </p>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="text-center p-2 bg-white/60 rounded-lg hover:bg-white transition-colors">
                  <div className="font-bold text-emerald-700 text-sm">
                    {formatPrice((product.price_per_kg_gbp * 0.1))}
                  </div>
                  <div className="text-gray-600 font-medium">Small Dog<br/>(100g)</div>
                </div>
                <div className="text-center p-2 bg-white/60 rounded-lg hover:bg-white transition-colors">
                  <div className="font-bold text-emerald-700 text-sm">
                    {formatPrice((product.price_per_kg_gbp * 0.15))}
                  </div>
                  <div className="text-gray-600 font-medium">Medium Dog<br/>(150g)</div>
                </div>
                <div className="text-center p-2 bg-white/60 rounded-lg hover:bg-white transition-colors">
                  <div className="font-bold text-emerald-700 text-sm">
                    {formatPrice((product.price_per_kg_gbp * 0.2))}
                  </div>
                  <div className="text-gray-600 font-medium">Large Dog<br/>(200g)</div>
                </div>
              </div>
            </div>
          )}

          {/* Category & Price */}

          {/* Discount Code */}
          {product.discount_code && (
            <div className="mt-4 bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 border-2 border-emerald-300 rounded-xl px-4 py-3 shadow-sm group-hover:shadow-lg transition-shadow">
              <p className="text-sm text-emerald-800 font-bold flex items-center gap-2">
                <span className="text-lg animate-bounce">💰</span>
                <span>Code: {product.discount_code}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
    </div>
  );
}
