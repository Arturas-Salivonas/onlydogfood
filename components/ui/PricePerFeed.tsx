'use client';

import { InfoIcon } from 'lucide-react';
import { formatPrice, calculatePricePerFeed, calculateMonthlyCost } from '@/lib/utils/format';
import { useState } from 'react';

interface PricePerFeedProps {
  pricePerKg: number;
  servingSize?: number; // grams per day
  showTooltip?: boolean;
  showMonthlyEstimate?: boolean;
}

export function PricePerFeed({
  pricePerKg,
  servingSize = 400, // Default for medium dog (20kg eating 2% body weight)
  showTooltip = true,
  showMonthlyEstimate = true
}: PricePerFeedProps) {
  const [showInfo, setShowInfo] = useState(false);

  const pricePerFeed = calculatePricePerFeed(pricePerKg, servingSize);
  const monthlyCost = calculateMonthlyCost(pricePerFeed);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 font-medium">Price per Feed</span>
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(pricePerFeed)}/day
          </span>
        </div>
        {showTooltip && (
          <div className="relative">
            <button
              onMouseEnter={() => setShowInfo(true)}
              onMouseLeave={() => setShowInfo(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Price calculation info"
            >
              <InfoIcon className="w-4 h-4" />
            </button>
            {showInfo && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg z-10">
                <p className="mb-1 font-semibold">How we calculate this:</p>
                <p className="text-gray-300">
                  Based on feeding a {servingSize}g per day (typical for a 20kg dog eating 2% of body weight).
                </p>
                <p className="text-gray-300 mt-1">
                  Price per kg: {formatPrice(pricePerKg)}
                </p>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
              </div>
            )}
          </div>
        )}
      </div>

      {showMonthlyEstimate && (
        <div className="flex items-baseline gap-1">
          <span className="text-xs text-gray-600">
            ≈ {formatPrice(monthlyCost)}/month
          </span>
        </div>
      )}

      <div className="text-xs text-gray-500">
        ({formatPrice(pricePerKg)}/kg)
      </div>
    </div>
  );
}

// Compact version for cards
interface PricePerFeedCompactProps {
  pricePerKg: number;
  servingSize?: number;
}

export function PricePerFeedCompact({ pricePerKg, servingSize = 400 }: PricePerFeedCompactProps) {
  const pricePerFeed = calculatePricePerFeed(pricePerKg, servingSize);

  return (
    <div className="flex flex-col">
      <span className="text-sm font-bold text-gray-900">
        {formatPrice(pricePerFeed)}<span className="text-xs text-gray-500">/day</span>
      </span>
      <span className="text-xs text-gray-500">
        {formatPrice(pricePerKg)}/kg
      </span>
    </div>
  );
}



