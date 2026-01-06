'use client';

import { Product } from '@/types';
import { FoodCard } from './FoodCard';
import { useState } from 'react';

interface BrandProductGridProps {
  products: Product[];
  brandName: string;
}

export function BrandProductGrid({ products, brandName }: BrandProductGridProps) {
  const [sortBy, setSortBy] = useState<'score' | 'price' | 'name'>('score');
  const [filterCategory, setFilterCategory] = useState<'all' | 'dry' | 'wet' | 'snack'>('all');

  // Filter products
  const filteredProducts = products.filter(product => {
    if (filterCategory === 'all') return true;
    return product.category === filterCategory;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'score':
        return (b.overall_score || 0) - (a.overall_score || 0);
      case 'price':
        if (!a.price_per_kg_gbp) return 1;
        if (!b.price_per_kg_gbp) return -1;
        return a.price_per_kg_gbp - b.price_per_kg_gbp;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  // Get category counts
  const categoryCounts = {
    all: products.length,
    dry: products.filter(p => p.category === 'dry').length,
    wet: products.filter(p => p.category === 'wet').length,
    snack: products.filter(p => p.category === 'snack').length,
  };

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg border-2 border-gray-200 p-12 text-center">
        <p className="text-gray-600">No products found for {brandName}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              All Products ({sortedProducts.length})
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Browse the complete range from {brandName}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Filter:</label>
              <div className="flex gap-1">
                {(['all', 'dry', 'wet', 'snack'] as const).map((category) => (
                  <button
                    key={category}
                    onClick={() => setFilterCategory(category)}
                    disabled={category !== 'all' && categoryCounts[category] === 0}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      filterCategory === category
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } ${category !== 'all' && categoryCounts[category] === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                    {category !== 'all' && ` (${categoryCounts[category]})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Sort:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'score' | 'price' | 'name')}
                className="px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="score">Highest Score</option>
                <option value="price">Lowest Price</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {sortedProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((product, index) => (
            <FoodCard
              key={product.id}
              product={product}
              showComparison={true}
              ranking={sortBy === 'score' && filterCategory === 'all' ? index + 1 : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border-2 border-gray-200 p-12 text-center">
          <p className="text-gray-600">
            No {filterCategory !== 'all' ? filterCategory : ''} products found
          </p>
        </div>
      )}
    </div>
  );
}



