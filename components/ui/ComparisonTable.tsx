'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { getScoreColor, getScoreGrade } from '@/scoring/calculator';
import { formatPrice, calculatePricePerFeed } from '@/lib/utils/format';
import { Check, X, Trophy } from 'lucide-react';

interface ComparisonTableProps {
  selectedProducts: Product[];
}

export function ComparisonTable({ selectedProducts }: ComparisonTableProps) {
  if (selectedProducts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <p className="text-gray-600">No products selected for comparison</p>
      </div>
    );
  }

  // Find best in each category
  const bestScores = {
    overall: Math.max(...selectedProducts.map(p => p.overall_score || 0)),
    ingredient: Math.max(...selectedProducts.map(p => p.ingredient_score || 0)),
    nutrition: Math.max(...selectedProducts.map(p => p.nutrition_score || 0)),
    value: Math.max(...selectedProducts.map(p => p.value_score || 0)),
    protein: Math.max(...selectedProducts.map(p => p.protein_percent || 0)),
    price: Math.min(...selectedProducts.filter(p => p.price_per_kg_gbp).map(p => p.price_per_kg_gbp || Infinity)),
  };

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg overflow-hidden">
      {/* Sticky Header */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-primary text-white sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wide border-r border-ring min-w-[200px] sticky left-0 bg-primary">
                Feature
              </th>
              {selectedProducts.map((product) => (
                <th key={product.id} className="px-6 py-4 text-center font-semibold min-w-[220px]">
                  <Link
                    href={`/dog-food/${product.slug}`}
                    className="hover:text-secondary transition-colors block"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-white">
                        {product.image_url ? (
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-contain p-2"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <span className="text-2xl">🐕</span>
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-semibold line-clamp-2">{product.name}</span>
                    </div>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {/* Overall Score */}
            <ComparisonRow
              label="Overall Score"
              highlight
              sticky
            >
              {selectedProducts.map((product) => {
                const score = product.overall_score || 0;
                const isWinner = score === bestScores.overall && score > 0;
                const gradeData = getScoreGrade(score);
                const colorClasses = getScoreColor(score);

                return (
                  <td key={product.id} className={`px-6 py-4 text-center ${isWinner ? 'bg-yellow-50' : ''}`}>
                    <div className="flex flex-col items-center gap-2">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${colorClasses.bgColor} border-2 ${isWinner ? 'border-yellow-400 shadow-lg' : 'border-gray-200'}`}>
                        <span className={`text-2xl font-bold ${colorClasses.color}`}>
                          {Math.round(score)}
                        </span>
                      </div>
                      <span className={`text-xs font-bold ${colorClasses.color}`}>{gradeData.grade} {gradeData.emoji}</span>
                      {isWinner && <Trophy className="w-5 h-5 text-yellow-500" />}
                    </div>
                  </td>
                );
              })}
            </ComparisonRow>

            {/* Price per Feed */}
            <ComparisonRow label="Price per Feed">
              {selectedProducts.map((product) => {
                const pricePerFeed = product.price_per_kg_gbp ? calculatePricePerFeed(product.price_per_kg_gbp, 400) : null;
                const isWinner = product.price_per_kg_gbp === bestScores.price && bestScores.price !== Infinity;

                return (
                  <td key={product.id} className={`px-6 py-4 text-center ${isWinner ? 'bg-green-50' : ''}`}>
                    {pricePerFeed ? (
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-lg font-bold text-gray-900">{formatPrice(pricePerFeed)}/day</span>
                        <span className="text-xs text-gray-500">({formatPrice(product.price_per_kg_gbp!)}/kg)</span>
                        {isWinner && <Trophy className="w-4 h-4 text-green-600" />}
                      </div>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                );
              })}
            </ComparisonRow>

            {/* Ingredient Score */}
            <ComparisonRow label="Ingredient Quality" highlight>
              {selectedProducts.map((product) => {
                const score = product.ingredient_score || 0;
                const isWinner = score === bestScores.ingredient && score > 0;

                return (
                  <td key={product.id} className={`px-6 py-4 text-center ${isWinner ? 'bg-green-50' : ''}`}>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-base font-bold text-gray-900">{score}/45</span>
                      {isWinner && <Trophy className="w-4 h-4 text-green-600" />}
                    </div>
                  </td>
                );
              })}
            </ComparisonRow>

            {/* Nutrition Score */}
            <ComparisonRow label="Nutritional Value">
              {selectedProducts.map((product) => {
                const score = product.nutrition_score || 0;
                const isWinner = score === bestScores.nutrition && score > 0;

                return (
                  <td key={product.id} className={`px-6 py-4 text-center ${isWinner ? 'bg-background' : ''}`}>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-base font-bold text-gray-900">{score}/33</span>
                      {isWinner && <Trophy className="w-4 h-4 text-primary" />}
                    </div>
                  </td>
                );
              })}
            </ComparisonRow>

            {/* Value Score */}
            <ComparisonRow label="Value for Money" highlight>
              {selectedProducts.map((product) => {
                const score = product.value_score || 0;
                const isWinner = score === bestScores.value && score > 0;

                return (
                  <td key={product.id} className={`px-6 py-4 text-center ${isWinner ? 'bg-secondary-50' : ''}`}>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-base font-bold text-gray-900">{score}/22</span>
                      {isWinner && <Trophy className="w-4 h-4 text-secondary-600" />}
                    </div>
                  </td>
                );
              })}
            </ComparisonRow>

            {/* Protein */}
            <ComparisonRow label="Protein">
              {selectedProducts.map((product) => {
                const protein = product.protein_percent || 0;
                const isWinner = protein === bestScores.protein && protein > 0;

                return (
                  <td key={product.id} className={`px-6 py-4 text-center ${isWinner ? 'bg-red-50' : ''}`}>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-base font-bold text-gray-900">{protein.toFixed(1)}%</span>
                      {isWinner && <Trophy className="w-4 h-4 text-red-600" />}
                    </div>
                  </td>
                );
              })}
            </ComparisonRow>

            {/* Fat */}
            <ComparisonRow label="Fat" highlight>
              {selectedProducts.map((product) => (
                <td key={product.id} className="px-6 py-4 text-center">
                  <span className="text-base text-gray-900">
                    {product.fat_percent ? `${product.fat_percent.toFixed(1)}%` : 'N/A'}
                  </span>
                </td>
              ))}
            </ComparisonRow>

            {/* Carbs */}
            <ComparisonRow label="Carbohydrates">
              {selectedProducts.map((product) => (
                <td key={product.id} className="px-6 py-4 text-center">
                  <span className="text-base text-gray-900">
                    {product.carbs_percent ? `${product.carbs_percent.toFixed(1)}%` : 'N/A'}
                  </span>
                </td>
              ))}
            </ComparisonRow>

            {/* Meat Content */}
            <ComparisonRow label="Meat Content" highlight>
              {selectedProducts.map((product) => (
                <td key={product.id} className="px-6 py-4 text-center">
                  <span className="text-base text-gray-900">
                    {product.meat_content_percent ? `${product.meat_content_percent}%` : 'N/A'}
                  </span>
                </td>
              ))}
            </ComparisonRow>

            {/* Brand */}
            <ComparisonRow label="Brand">
              {selectedProducts.map((product) => (
                <td key={product.id} className="px-6 py-4 text-center">
                  <Link
                    href={`/brands/${product.brand?.slug}`}
                    className="text-sm font-medium text-primary hover:text-primary"
                  >
                    {product.brand?.name || 'N/A'}
                  </Link>
                </td>
              ))}
            </ComparisonRow>
          </tbody>
        </table>
      </div>

      {/* Mobile Swipe Hint */}
      <div className="md:hidden p-4 bg-background border-t border-secondary text-center">
        <p className="text-xs text-primary">
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
    <tr className={highlight ? 'bg-gray-50' : ''}>
      <td className={`px-6 py-4 text-sm font-bold text-gray-900 border-r border-gray-200 ${sticky ? 'sticky left-0 bg-gray-100 z-10' : highlight ? 'bg-gray-50' : 'bg-white'}`}>
        {label}
      </td>
      {children}
    </tr>
  );
}
