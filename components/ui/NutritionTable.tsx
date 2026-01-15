'use client';

import { Product } from '@/types';
import { AlertTriangle, Info } from 'lucide-react';
import { ProtectionIcon } from './ProtectionIcon';
import { OPTIMAL_RANGES } from '@/scoring/config';

interface NutritionTableProps {
  product: Product;
  showWarnings?: boolean;
}

export function NutritionTable({ product, showWarnings = true }: NutritionTableProps) {
  const nutritionData = [
    {
      label: 'Protein',
      value: product.protein_percent,
      unit: '%',
      optimal: { min: OPTIMAL_RANGES.PROTEIN_MIN, max: OPTIMAL_RANGES.PROTEIN_OPTIMAL_MAX },
      description: 'Essential for muscle development and energy',
    },
    {
      label: 'Fat',
      value: product.fat_percent,
      unit: '%',
      optimal: { min: OPTIMAL_RANGES.FAT_MIN, max: OPTIMAL_RANGES.FAT_MAX },
      description: 'Provides energy and supports healthy skin and coat',
    },
    {
      label: 'Fiber',
      value: product.fiber_percent,
      unit: '%',
      optimal: { min: OPTIMAL_RANGES.FIBER_MIN, max: OPTIMAL_RANGES.FIBER_MAX },
      description: 'Aids digestion and gut health',
    },
    {
      label: 'Moisture',
      value: product.moisture_percent,
      unit: '%',
      optimal: null,
      description: 'Water content in the food',
    },
    {
      label: 'Carbohydrates',
      value: product.carbs_percent || calculateCarbs(product),
      unit: '%',
      optimal: { min: 0, max: OPTIMAL_RANGES.CARBS_MAX },
      description: 'Source of energy (calculated)',
    },
    {
      label: 'Ash',
      value: product.ash_percent,
      unit: '%',
      optimal: null,
      description: 'Mineral content',
    },
  ];

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
      <div className="bg-primary-hover px-6 py-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Info className="w-5 h-5" />
          Guaranteed Analysis
        </h3>
        <p className="text-sm text-foreground mt-1">Nutritional breakdown per 100g</p>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {nutritionData.map((item, index) => {
            if (item.value === null || item.value === undefined) return null;

            const status = item.optimal
              ? getNutrientStatus(item.value, item.optimal.min, item.optimal.max)
              : 'normal';

            return (
              <div key={index} className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{item.label}</span>
                    {showWarnings && status !== 'normal' && (
                      <StatusIcon status={status} />
                    )}
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    {item.value.toFixed(1)}{item.unit}
                  </span>
                </div>

                {/* Progress bar */}
                {item.optimal && (
                  <div className="mb-1">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${getBarColor(status)}`}
                        style={{
                          width: `${Math.min(100, (item.value / (item.optimal.max * 1.2)) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Optimal: {item.optimal.min}-{item.optimal.max}{item.unit}</span>
                      {status !== 'normal' && showWarnings && (
                        <span className={getStatusTextColor(status)}>
                          {status === 'high' ? 'Above optimal' : 'Below optimal'}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-600">{item.description}</p>
              </div>
            );
          })}
        </div>

        {/* Calories */}
        {product.calories_per_100g && (
          <div className="mt-6 pt-6 border-t-2 border-gray-200">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900">Calories</span>
              <span className="text-lg font-bold text-gray-900">
                {product.calories_per_100g} kcal/100g
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">Energy content</p>
          </div>
        )}

        {/* Info note */}
        <div className="mt-6 p-4 bg-background rounded-lg border border-secondary">
          <p className="text-xs text-primary leading-relaxed">
            <strong>Note:</strong> These values are based on guaranteed analysis. Actual values may vary.
            Optimal ranges are for average adult dogs and may differ based on life stage, size, and activity level.
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function calculateCarbs(product: Product): number {
  const protein = product.protein_percent || 0;
  const fat = product.fat_percent || 0;
  const ash = product.ash_percent || 0;
  const moisture = product.moisture_percent || 0;
  const fiber = product.fiber_percent || 0;

  return Math.max(0, 100 - protein - fat - ash - moisture - fiber);
}

function getNutrientStatus(
  value: number,
  min: number,
  max: number
): 'low' | 'normal' | 'high' {
  if (value < min) return 'low';
  if (value > max) return 'high';
  return 'normal';
}

function StatusIcon({ status }: { status: 'low' | 'normal' | 'high' }) {
  if (status === 'normal') {
    return <ProtectionIcon className="w-4 h-4" />;
  }
  return <AlertTriangle className="w-4 h-4 text-amber-600" />;
}

function getBarColor(status: 'low' | 'normal' | 'high'): string {
  switch (status) {
    case 'low':
      return 'bg-amber-400';
    case 'high':
      return 'bg-amber-400';
    case 'normal':
      return 'bg-success';
  }
}

function getStatusTextColor(status: 'low' | 'normal' | 'high'): string {
  switch (status) {
    case 'low':
      return 'text-amber-600';
    case 'high':
      return 'text-amber-600';
    case 'normal':
      return 'text-green-600';
  }
}
