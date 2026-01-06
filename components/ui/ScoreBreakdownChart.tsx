'use client';

import { Product } from '@/types';
import { BarChart3, Info } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface ScoreBreakdownChartProps {
  product: Product;
}

export function ScoreBreakdownChart({ product }: ScoreBreakdownChartProps) {
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  const scores = [
    {
      id: 'ingredient',
      label: 'Ingredient Quality',
      score: product.ingredient_score || 0,
      maxScore: 45,
      color: 'bg-success',
      hoverColor: 'hover:bg-success',
      description: 'Quality of ingredients, meat content, and absence of fillers',
    },
    {
      id: 'nutrition',
      label: 'Nutritional Value',
      score: product.nutrition_score || 0,
      maxScore: 33,
      color: 'bg-ring',
      hoverColor: 'hover:bg-primary',
      description: 'Protein, fat, and carbohydrate balance for optimal health',
    },
    {
      id: 'value',
      label: 'Value for Money',
      score: product.value_score || 0,
      maxScore: 22,
      color: 'bg-secondary',
      hoverColor: 'hover:bg-secondary-hover',
      description: 'Price compared to similar products in the category',
    },
  ];

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-secondary px-6 py-4">
        <h3 className="text-xl font-bold text-black flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Score Breakdown
        </h3>
        <p className="text-sm text-black mt-1">How we calculated the overall score</p>
      </div>

      {/* Overall Score */}
      <div className="p-6 bg-primary border-b-2 border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 font-medium mb-1">Overall Score</p>
            <p className="text-4xl font-bold text-gray-900">
              {Math.round(product.overall_score || 0)}<span className="text-xl text-gray-600">/100</span>
            </p>
          </div>
          <div className="text-right">
            <Link
              href="/how-we-score"
              className="inline-flex items-center gap-1 text-sm text-secondary hover:text-primary font-medium"
            >
              <Info className="w-4 h-4" />
              Scoring methodology
            </Link>
          </div>
        </div>
      </div>

      {/* Score Bars */}
      <div className="p-6 space-y-6">
        {scores.map((item) => {
          const percentage = (item.score / item.maxScore) * 100;
          const isHovered = hoveredBar === item.id;

          return (
            <div
              key={item.id}
              className="relative"
              onMouseEnter={() => setHoveredBar(item.id)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              {/* Label and Score */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{item.label}</span>
                  {isHovered && (
                    <Info className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {item.score}<span className="text-sm text-gray-600">/{item.maxScore}</span>
                </span>
              </div>

              {/* Progress Bar */}
              <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                <div
                  className={`h-full ${item.color} ${item.hoverColor} transition-all duration-500 ease-out rounded-full flex items-center justify-end pr-3`}
                  style={{ width: `${Math.max(percentage, 5)}%` }}
                >
                  <span className="text-xs font-bold text-white">
                    {Math.round(percentage)}%
                  </span>
                </div>
              </div>

              {/* Description Tooltip */}
              {isHovered && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700">
                  {item.description}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detailed Breakdown */}
      {product.scoring_breakdown?.details && (
        <div className="px-6 pb-6">
          <details className="group">
            <summary className="cursor-pointer list-none">
              <div className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <span className="font-semibold text-gray-900">View Detailed Point Breakdown</span>
                <svg
                  className="w-5 h-5 text-gray-600 transform transition-transform group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </summary>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
              {Object.entries(product.scoring_breakdown.details).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="font-semibold text-gray-900">+{value} pts</span>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}


    </div>
  );
}
