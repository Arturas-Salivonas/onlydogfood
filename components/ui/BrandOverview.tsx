'use client';

import { Brand } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Star, Package, TrendingUp } from 'lucide-react';
import { getScoreColor, getScoreGrade } from '@/scoring/calculator';

interface BrandOverviewProps {
  brand: Brand;
  bestProduct?: {
    name: string;
    slug: string;
    overall_score: number;
  };
  priceRange?: {
    min: number;
    max: number;
  };
}

export function BrandOverview({ brand, bestProduct, priceRange }: BrandOverviewProps) {
  const averageScore = brand.overall_score || 0;
  const scoreGrade = getScoreGrade(averageScore);
  const scoreInfo = getScoreColor(averageScore);

  // Map getScoreColor properties to class names
  const getClassNames = (score: number) => {
    if (score >= 80) return { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-700' };
    if (score >= 60) return { bg: 'bg-lime-100', border: 'border-lime-300', text: 'text-lime-700' };
    if (score >= 40) return { bg: 'bg-amber-100', border: 'border-amber-300', text: 'text-amber-700' };
    return { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-700' };
  };

  const colorClasses = getClassNames(averageScore);

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg overflow-hidden">
      {/* Header with Gradient */}
      <div className="bg-primary p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Brand Logo */}
          <div className="relative w-32 h-32 rounded-2xl overflow-hidden bg-white shadow-xl flex-shrink-0">
            {brand.logo_url ? (
              <Image
                src={brand.logo_url}
                alt={brand.name}
                fill
                className="object-contain p-4"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-6xl">🏷️</span>
              </div>
            )}
          </div>

          {/* Brand Info */}
          <div className="flex-1 text-center md:text-left text-white">
            <h1 className="text-4xl font-bold mb-2">{brand.name}</h1>
            {brand.country_of_origin && (
              <p className="text-foreground mb-4">
                🌍 Made in {brand.country_of_origin}
              </p>
            )}
            {brand.description && (
              <p className="text-background leading-relaxed max-w-2xl">
                {brand.description}
              </p>
            )}
          </div>

          {/* Brand Website */}
          {brand.website_url && (
            <div>
              <a
                href={brand.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-6 py-3 rounded-lg hover:bg-background transition-colors"
              >
                Visit Website
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 bg-background">
        {/* Average Score */}
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${colorClasses.bg} border-2 ${colorClasses.border} shadow-lg mb-3`}>
            <span className={`text-3xl font-bold ${colorClasses.text}`}>
              {Math.round(averageScore)}
            </span>
          </div>
          <p className="text-sm font-semibold text-gray-900">Average Score</p>
          <p className={`text-xs font-bold ${colorClasses.text}`}>{scoreGrade}</p>
        </div>

        {/* Total Products */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary-100 border-2 border-secondary-300 shadow-lg mb-3">
            <Package className="w-10 h-10 text-secondary-600" />
          </div>
          <p className="text-sm font-semibold text-gray-900">Products</p>
          <p className="text-2xl font-bold text-secondary-600">{brand.total_products}</p>
        </div>

        {/* Price Range */}
        {priceRange && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 border-2 border-green-300 shadow-lg mb-3">
              <TrendingUp className="w-10 h-10 text-green-600" />
            </div>
            <p className="text-sm font-semibold text-gray-900">Price Range</p>
            <p className="text-lg font-bold text-green-600">
              £{priceRange.min.toFixed(2)} - £{priceRange.max.toFixed(2)}
            </p>
            <p className="text-xs text-gray-600">per kg</p>
          </div>
        )}

        {/* Best Product */}
        {bestProduct && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 border-2 border-amber-300 shadow-lg mb-3">
              <Star className="w-10 h-10 text-amber-600" />
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">Top Product</p>
            <Link
              href={`/dog-food/${bestProduct.slug}`}
              className="text-sm text-primary hover:text-primary font-medium line-clamp-2"
            >
              {bestProduct.name}
            </Link>
            <p className="text-xs text-gray-600 mt-1">
              Score: {Math.round(bestProduct.overall_score)}/100
            </p>
          </div>
        )}
      </div>

      {/* Featured/Sponsored Badge */}
      {(brand.is_featured || brand.is_sponsored) && (
        <div className="px-8 py-4 bg-orange-50 border-t border-amber-200">
          <div className="flex items-center justify-center gap-2 text-amber-800">
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            <span className="font-bold">
              {brand.is_sponsored ? 'Sponsored Brand' : 'Featured Brand'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}



