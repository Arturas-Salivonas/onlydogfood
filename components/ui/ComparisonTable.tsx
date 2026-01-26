'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { getScoreColor, getScoreGrade } from '@/scoring/calculator';
import { formatPrice, calculatePricePerFeed } from '@/lib/utils/format';
import { Trophy, Crown } from 'lucide-react';

interface ComparisonTableProps {
  selectedProducts: Product[];
}

export function ComparisonTable({ selectedProducts }: ComparisonTableProps) {
  if (selectedProducts.length === 0) {
    return (
      <div className="bg-[var(--color-background-card)] rounded-lg shadow-[var(--shadow-small)] border border-[var(--color-border)] p-12 text-center">
        <p className="text-[var(--color-text-secondary)] text-base">No products selected for comparison</p>
      </div>
    );
  }

  // Find best in each category
  const bestScores = {
    overall: Math.max(...selectedProducts.map(p => p.overall_score ?? 0)),
    ingredient: Math.max(...selectedProducts.map(p => p.ingredient_score ?? 0)),
    nutrition: Math.max(...selectedProducts.map(p => p.nutrition_score ?? 0)),
    value: Math.max(...selectedProducts.map(p => p.value_score ?? 0)),
    protein: Math.max(...selectedProducts.map(p => p.protein_percent ?? 0)),
    fat: Math.max(...selectedProducts.map(p => p.fat_percent ?? 0)),
    fiber: Math.max(...selectedProducts.map(p => p.fiber_percent ?? 0)),
    price: Math.min(...selectedProducts.filter(p => p.price_per_kg_gbp).map(p => p.price_per_kg_gbp || Infinity)),
  };

  return (
    <div className="bg-[var(--color-background-card)] rounded-xl border-2 border-[var(--color-border)] shadow-[var(--shadow-large)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" role="table" aria-label="Dog food product comparison table">
          {/* Header */}
          <thead className="bg-[var(--color-trust)] text-[var(--color-background-card)] sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wide border-r border-[var(--color-trust-light)] min-w-[160px] sticky left-0 bg-[var(--color-trust)]">
                Feature
              </th>
              {selectedProducts.map((product) => (
                <th key={product.id} className="px-4 py-3 text-center font-bold min-w-[200px]">
                  <Link
                    href={`/dog-food/${product.slug}`}
                    className="hover:text-[var(--color-caution)] transition-colors block"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-[var(--color-background-card)] shadow-[var(--shadow-small)]">
                        {product.image_url ? (
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-contain p-1"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <span className="text-xl">🐕</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-bold line-clamp-2">{product.name}</span>
                    </div>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--color-border)]">
            {/* Overall Score */}
            <ComparisonRow label="Overall Score" highlight sticky>
              {selectedProducts.map((product) => {
                const score = product.overall_score || 0;
                const isWinner = score === bestScores.overall && score > 0;
                const gradeData = getScoreGrade(score);

                return (
                  <td key={product.id} className={`px-4 py-3 text-center relative ${isWinner ? 'bg-gradient-to-b from-yellow-50 to-transparent' : ''}`}>
                    {isWinner && (
                      <div className="absolute top-1 right-1">
                        <Crown className="w-5 h-5 text-yellow-500 fill-yellow-400" />
                      </div>
                    )}
                    <div className="flex flex-col items-center gap-1">
                      <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full border-2 ${isWinner ? 'border-yellow-500 shadow-lg ring-2 ring-yellow-200' : 'border-[var(--color-border)]'}`}
                        style={{
                          backgroundColor: score >= 85 ? '#10b981' : score >= 70 ? '#8FAF9F' : score >= 50 ? '#f59e0b' : '#ef4444',
                          color: 'white'
                        }}
                      >
                        <span className="text-xl font-bold">
                          {Math.round(score)}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[var(--color-text-primary)]">{gradeData.grade} {gradeData.emoji}</span>
                    </div>
                  </td>
                );
              })}
            </ComparisonRow>

            {/* Brand */}
            <ComparisonRow label="Brand">
              {selectedProducts.map((product) => (
                <td key={product.id} className="px-4 py-2 text-center">
                  {product.brand ? (
                    <Link
                      href={`/brands/${product.brand.slug}`}
                      className="text-sm font-bold text-[var(--color-trust)] hover:text-[var(--color-trust)] hover:underline"
                    >
                      {product.brand.name}
                    </Link>
                  ) : (
                    <span className="text-sm text-[var(--color-text-secondary)]">N/A</span>
                  )}
                </td>
              ))}
            </ComparisonRow>

            {/* Category */}
            <ComparisonRow label="Category" highlight>
              {selectedProducts.map((product) => (
                <td key={product.id} className="px-4 py-2 text-center">
                  <span className="text-base text-[var(--color-text-primary)] font-bold capitalize">
                    {product.category || 'N/A'}
                  </span>
                </td>
              ))}
            </ComparisonRow>

            {/* Price per Feed */}
            <ComparisonRow label="Price per Day">
              {selectedProducts.map((product) => {
                const pricePerFeed = product.price_per_kg_gbp ? calculatePricePerFeed(product.price_per_kg_gbp, 400) : null;
                const isWinner = product.price_per_kg_gbp === bestScores.price && bestScores.price !== Infinity;

                return (
                  <td key={product.id} className={`px-4 py-2 text-center relative ${isWinner ? 'bg-gradient-to-b from-yellow-50 to-transparent' : ''}`}>
                    {isWinner && <Crown className="w-4 h-4 text-yellow-500 fill-yellow-400 absolute top-1 right-1" />}
                    {pricePerFeed ? (
                      <div className="flex flex-col items-center">
                        <span className={`text-base font-bold ${isWinner ? 'text-yellow-700' : 'text-[var(--color-text-primary)]'}`}>{formatPrice(pricePerFeed)}/day</span>
                        <span className="text-xs text-[var(--color-text-secondary)]">{formatPrice(product.price_per_kg_gbp!)}/kg</span>
                      </div>
                    ) : (
                      <span className="text-[var(--color-text-secondary)]">N/A</span>
                    )}
                  </td>
                );
              })}
            </ComparisonRow>

            {/* Package Size */}
            <ComparisonRow label="Package Size" highlight>
              {selectedProducts.map((product) => (
                <td key={product.id} className="px-4 py-2 text-center">
                  <span className="text-base text-[var(--color-text-primary)]">
                    {product.package_size_g ? `${(product.package_size_g / 1000).toFixed(1)} kg` : 'N/A'}
                  </span>
                </td>
              ))}
            </ComparisonRow>

            {/* Scores Section Header */}
            <tr className="bg-[var(--color-trust-bg)]">
              <td colSpan={selectedProducts.length + 1} className="px-4 py-2">
                <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wide">Scores</h3>
              </td>
            </tr>

            {/* Ingredient Score */}
            <ComparisonRow label="Ingredient Quality">
              {selectedProducts.map((product) => {
                const score = product.ingredient_score ?? 0;
                const isWinner = score === bestScores.ingredient && score > 0;

                return (
                  <td key={product.id} className={`px-4 py-2 text-center relative ${isWinner ? 'bg-gradient-to-b from-yellow-50 to-transparent' : ''}`}>
                    {isWinner && <Crown className="w-4 h-4 text-yellow-500 fill-yellow-400 absolute top-1 right-1" />}
                    <span className={`text-base font-bold ${isWinner ? 'text-yellow-700' : 'text-[var(--color-text-primary)]'}`}>
                      {score > 0 ? score : 0}<span className="text-xs text-[var(--color-text-secondary)]">/52</span>
                    </span>
                  </td>
                );
              })}
            </ComparisonRow>

            {/* Nutrition Score */}
            <ComparisonRow label="Nutritional Value" highlight>
              {selectedProducts.map((product) => {
                const score = product.nutrition_score ?? 0;
                const isWinner = score === bestScores.nutrition && score > 0;

                return (
                  <td key={product.id} className={`px-4 py-2 text-center relative ${isWinner ? 'bg-gradient-to-b from-yellow-50 to-transparent' : ''}`}>
                    {isWinner && <Crown className="w-4 h-4 text-yellow-500 fill-yellow-400 absolute top-1 right-1" />}
                    <span className={`text-base font-bold ${isWinner ? 'text-yellow-700' : 'text-[var(--color-text-primary)]'}`}>
                      {score > 0 ? score : 0}<span className="text-xs text-[var(--color-text-secondary)]">/33</span>
                    </span>
                  </td>
                );
              })}
            </ComparisonRow>

            {/* Value Score */}
            <ComparisonRow label="Value for Money">
              {selectedProducts.map((product) => {
                const score = product.value_score ?? 0;
                const isWinner = score === bestScores.value && score > 0;

                return (
                  <td key={product.id} className={`px-4 py-2 text-center relative ${isWinner ? 'bg-gradient-to-b from-yellow-50 to-transparent' : ''}`}>
                    {isWinner && <Crown className="w-4 h-4 text-yellow-500 fill-yellow-400 absolute top-1 right-1" />}
                    <span className={`text-base font-bold ${isWinner ? 'text-yellow-700' : 'text-[var(--color-text-primary)]'}`}>
                      {score > 0 ? score : 0}<span className="text-xs text-[var(--color-text-secondary)]">/15</span>
                    </span>
                  </td>
                );
              })}
            </ComparisonRow>

            {/* Nutrition Section Header */}
            <tr className="bg-[var(--color-trust-bg)]">
              <td colSpan={selectedProducts.length + 1} className="px-4 py-2">
                <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wide">Nutritional Content</h3>
              </td>
            </tr>

            {/* Protein */}
            <ComparisonRow label="Protein" highlight>
              {selectedProducts.map((product) => {
                const protein = product.protein_percent || 0;
                const isWinner = protein === bestScores.protein && protein > 0;

                return (
                  <td key={product.id} className={`px-4 py-2 text-center relative ${isWinner ? 'bg-gradient-to-b from-yellow-50 to-transparent' : ''}`}>
                    {isWinner && <Crown className="w-4 h-4 text-yellow-500 fill-yellow-400 absolute top-1 right-1" />}
                    <span className={`text-base font-bold ${isWinner ? 'text-yellow-700' : 'text-[var(--color-text-primary)]'}`}>
                      {protein > 0 ? `${protein.toFixed(1)}%` : 'N/A'}
                    </span>
                  </td>
                );
              })}
            </ComparisonRow>

            {/* Fat */}
            <ComparisonRow label="Fat">
              {selectedProducts.map((product) => {
                const fat = product.fat_percent || 0;
                const isWinner = fat === bestScores.fat && fat > 0;

                return (
                  <td key={product.id} className={`px-4 py-2 text-center relative ${isWinner ? 'bg-gradient-to-b from-yellow-50 to-transparent' : ''}`}>
                    {isWinner && <Crown className="w-4 h-4 text-yellow-500 fill-yellow-400 absolute top-1 right-1" />}
                    <span className={`text-base ${isWinner ? 'text-yellow-700 font-bold' : 'text-[var(--color-text-primary)]'}`}>
                      {fat > 0 ? `${fat.toFixed(1)}%` : 'N/A'}
                    </span>
                  </td>
                );
              })}
            </ComparisonRow>

            {/* Fiber */}
            <ComparisonRow label="Fiber" highlight>
              {selectedProducts.map((product) => {
                const fiber = product.fiber_percent || 0;
                const isWinner = fiber === bestScores.fiber && fiber > 0;

                return (
                  <td key={product.id} className={`px-4 py-2 text-center relative ${isWinner ? 'bg-gradient-to-b from-yellow-50 to-transparent' : ''}`}>
                    {isWinner && <Crown className="w-4 h-4 text-yellow-500 fill-yellow-400 absolute top-1 right-1" />}
                    <span className={`text-base ${isWinner ? 'text-yellow-700 font-bold' : 'text-[var(--color-text-primary)]'}`}>
                      {fiber > 0 ? `${fiber.toFixed(1)}%` : 'N/A'}
                    </span>
                  </td>
                );
              })}
            </ComparisonRow>

            {/* Carbs */}
            <ComparisonRow label="Carbohydrates">
              {selectedProducts.map((product) => {
                // Use database carbs_percent if available, otherwise calculate
                let carbs = product.carbs_percent;
                if (!carbs && product.protein_percent && product.fat_percent) {
                  const protein = product.protein_percent;
                  const fat = product.fat_percent;
                  const fiber = product.fiber_percent || 0;
                  const moisture = product.moisture_percent || 10;
                  const ash = product.ash_percent || 8;
                  carbs = 100 - protein - fat - fiber - moisture - ash;
                }

                return (
                  <td key={product.id} className="px-4 py-2 text-center">
                    <span className="text-base text-[var(--color-text-primary)]">
                      {carbs && carbs > 0 ? `${carbs.toFixed(1)}%` : 'N/A'}
                    </span>
                  </td>
                );
              })}
            </ComparisonRow>

            {/* Meat Content */}
            <ComparisonRow label="Meat Content" highlight>
              {selectedProducts.map((product) => (
                <td key={product.id} className="px-4 py-2 text-center">
                  <span className="text-base font-bold text-[var(--color-text-primary)]">
                    {product.effective_meat_percent ? `${product.effective_meat_percent.toFixed(1)}%` : 'N/A'}
                  </span>
                </td>
              ))}
            </ComparisonRow>

            {/* Calories */}
            <ComparisonRow label="Calories (per 100g)">
              {selectedProducts.map((product) => (
                <td key={product.id} className="px-4 py-2 text-center">
                  <span className="text-base text-[var(--color-text-primary)]">
                    {product.calories_per_100g ? `${product.calories_per_100g} kcal` : 'N/A'}
                  </span>
                </td>
              ))}
            </ComparisonRow>

            {/* Ingredients Section Header */}
            <tr className="bg-[var(--color-trust-bg)]">
              <td colSpan={selectedProducts.length + 1} className="px-4 py-2">
                <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wide">First 5 Ingredients</h3>
              </td>
            </tr>

            {/* First 5 Ingredients */}
            <ComparisonRow label="Top Ingredients" highlight>
              {selectedProducts.map((product) => (
                <td key={product.id} className="px-4 py-3">
                  {product.ingredients_list && product.ingredients_list.length > 0 ? (
                    <ol className="text-sm text-[var(--color-text-primary)] text-left space-y-0.5">
                      {product.ingredients_list.slice(0, 5).map((ingredient, index) => (
                        <li key={index} className="truncate">
                          {index + 1}. {ingredient}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <span className="text-[var(--color-text-secondary)] text-sm">No ingredient data</span>
                  )}
                </td>
              ))}
            </ComparisonRow>

            {/* Buy Now Section */}
            <tr className="bg-[var(--color-background-neutral)]">
              <td className="px-4 py-4 text-xs font-bold text-[var(--color-text-primary)] border-r border-[var(--color-border)]">
                Purchase
              </td>
              {selectedProducts.map((product) => (
                <td key={product.id} className="px-4 py-4 text-center">
                  {product.affiliate_url ? (
                    <a
                      href={product.affiliate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-6 py-2.5 bg-[var(--color-success)] text-white rounded-lg text-sm font-bold hover:bg-[var(--color-success-dark)] transition-all shadow-[var(--shadow-small)] hover:shadow-[var(--shadow-medium)]"
                      aria-label={`Buy ${product.name} - opens in new tab`}
                    >
                      Buy Now
                    </a>
                  ) : (
                    <Link
                      href={`/dog-food/${product.slug}`}
                      className="inline-flex items-center justify-center px-6 py-2.5 bg-[var(--color-trust)] text-white rounded-lg text-sm font-bold hover:opacity-90 transition-all shadow-[var(--shadow-small)] hover:shadow-[var(--shadow-medium)]"
                      aria-label={`View details for ${product.name}`}
                    >
                      View Details
                    </Link>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mobile Swipe Hint */}
      <div className="md:hidden p-4 bg-[var(--color-trust-bg)] border-t border-[var(--color-border)] text-center">
        <p className="text-xs text-[var(--color-text-primary)] font-bold">
          👉 Swipe left/right to see all products
        </p>
      </div>
    </div>
  );
}

// Row component for consistent styling
interface ComparisonRowProps {
  label: string;
  children: React.ReactNode;
  highlight?: boolean;
  sticky?: boolean;
}

function ComparisonRow({ label, children, highlight = false, sticky = false }: ComparisonRowProps) {
  return (
    <tr className={highlight ? 'bg-[var(--color-background-neutral)]' : 'bg-[var(--color-background-card)]'}>
      <td className={`px-4 py-2 text-xs font-bold text-[var(--color-text-primary)] border-r border-[var(--color-border)] ${
        sticky ? 'sticky left-0 z-10' : ''
      } ${highlight ? 'bg-[var(--color-background-neutral)]' : 'bg-[var(--color-background-card)]'}`}>
        {label}
      </td>
      {children}
    </tr>
  );
}
