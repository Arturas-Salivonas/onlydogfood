'use client';

import { Product } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { ScoreBadge } from './ScoreDisplay';
import { PricePerFeed } from './PricePerFeed';
import { IngredientFlagsGroup } from './IngredientFlag';
import { ExternalLink, ShoppingCart } from 'lucide-react';
import { FILLERS, ARTIFICIAL_ADDITIVES } from '@/scoring/config';

interface FoodSummaryPanelProps {
  product: Product;
  sticky?: boolean;
}

export function FoodSummaryPanel({ product, sticky = true }: FoodSummaryPanelProps) {
  // Generate best for text
  const bestForText = generateBestForText(product);

  // Generate ingredient flags
  const ingredientFlags = generateIngredientFlags(product);

  // Get category tags
  const categoryTags = getCategoryTags(product);

  return (
    <div className={`bg-white rounded-xl border-2 border-gray-200 shadow-lg overflow-hidden ${sticky ? 'lg:sticky lg:top-4' : ''}`}>
      {/* Product Image */}
      <div className="relative aspect-square bg-background p-6">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-contain p-4"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-9xl">🐕</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Brand */}
        <Link
          href={`/brands/${product.brand?.slug}`}
          className="inline-block text-sm font-bold text-primary hover:text-primary mb-2 uppercase tracking-wide"
        >
          {product.brand?.name}
        </Link>

        {/* Product Name */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
          {product.name}
        </h1>

        {/* Score Badge */}
        <div className="mb-6 flex justify-center">
          <ScoreBadge score={product.overall_score || 0} size="lg" />
        </div>

        {/* Best For */}
        {bestForText && (
          <div className="mb-6 p-4 bg-background rounded-lg border border-secondary">
            <p className="text-sm font-semibold text-foreground mb-1">🎯 Best For:</p>
            <p className="text-sm text-primary">{bestForText}</p>
          </div>
        )}

        {/* Category Tags */}
        {categoryTags.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {categoryTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Ingredient Flags */}
        {ingredientFlags.length > 0 && (
          <div className="mb-6">
            <IngredientFlagsGroup flags={ingredientFlags} />
          </div>
        )}

        {/* Price Per Feed */}
        {product.price_per_kg_gbp && (
          <div className="mb-6 p-4 bg-emerald-50 rounded-lg border border-green-200">
            <PricePerFeed
              pricePerKg={product.price_per_kg_gbp}
              showTooltip={true}
              showMonthlyEstimate={true}
            />
          </div>
        )}

        {/* CTAs */}
        <div className="space-y-3">
          {/* Affiliate Link */}
          {product.affiliate_url && (
            <a
              href={product.affiliate_url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="block w-full bg-primary-hover hover:from-primary-hover hover:to-primary text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 text-center"
            >
              <span className="flex items-center justify-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Buy Now
                <ExternalLink className="w-4 h-4" />
              </span>
            </a>
          )}

          {/* Compare Link */}
          <Link
            href="/compare"
            className="block w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-6 rounded-xl border-2 border-gray-300 hover:border-gray-400 transition-all text-center"
          >
            Compare with Others
          </Link>

          {/* View Alternatives */}
          <button
            onClick={() => {
              const element = document.getElementById('alternatives');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="block w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-6 rounded-xl border-2 border-gray-300 hover:border-gray-400 transition-all text-center"
          >
            View Alternatives
          </button>
        </div>

        {/* Discount Code */}
        {product.discount_code && (
          <div className="mt-6 p-4 bg-orange-50 border-2 border-amber-300 rounded-xl">
            <p className="text-xs text-amber-800 font-semibold mb-1">💰 DISCOUNT CODE</p>
            <p className="text-lg font-bold text-amber-900 font-mono">{product.discount_code}</p>
            {product.discount_description && (
              <p className="text-xs text-amber-700 mt-1">{product.discount_description}</p>
            )}
          </div>
        )}

        {/* Last Updated */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Last updated: {new Date(product.updated_at).toLocaleDateString('en-GB', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function generateBestForText(product: Product): string {
  const tags: string[] = [];

  // Life stage
  if (product.sub_category) {
    try {
      const subCategories = typeof product.sub_category === 'string'
        ? JSON.parse(product.sub_category)
        : product.sub_category;

      if (Array.isArray(subCategories)) {
        if (subCategories.includes('Puppy')) tags.push('puppies');
        if (subCategories.includes('Senior')) tags.push('senior dogs');
        if (subCategories.includes('All Life Stages')) tags.push('all life stages');
      }
    } catch {
      // Ignore
    }
  }

  // Protein level
  if (product.protein_percent && product.protein_percent >= 30) {
    tags.push('active dogs');
  }

  // Grain-free
  const hasGrainFree = product.tags?.some(t => t.name === 'Grain-Free');
  if (hasGrainFree) {
    tags.push('grain-sensitive dogs');
  }

  return tags.length > 0 ? tags.join(', ') : 'adult dogs';
}

function generateIngredientFlags(product: Product) {
  const flags: Array<{ type: 'positive' | 'warning' | 'negative'; label: string; reason?: string }> = [];
  const ingredientsText = product.ingredients_raw?.toLowerCase() || '';

  // High meat content
  if (product.meat_content_percent && product.meat_content_percent >= 50) {
    flags.push({
      type: 'positive',
      label: `${product.meat_content_percent}% Meat`,
      reason: 'High meat content provides quality protein',
    });
  }

  // No fillers
  const hasFillers = FILLERS.some(filler => ingredientsText.includes(filler));
  if (hasFillers) {
    flags.push({
      type: 'warning',
      label: 'Contains Fillers',
      reason: 'Contains corn, wheat, or soy',
    });
  } else if (ingredientsText) {
    flags.push({
      type: 'positive',
      label: 'No Fillers',
      reason: 'Free from corn, wheat, and soy',
    });
  }

  // Artificial additives
  const hasAdditives = ARTIFICIAL_ADDITIVES.some(additive => ingredientsText.includes(additive));
  if (hasAdditives) {
    flags.push({
      type: 'negative',
      label: 'Artificial Additives',
      reason: 'Contains artificial colors, flavors, or preservatives',
    });
  } else if (ingredientsText) {
    flags.push({
      type: 'positive',
      label: 'Natural Ingredients',
      reason: 'No artificial additives',
    });
  }

  return flags;
}

function getCategoryTags(product: Product): string[] {
  const tags: string[] = [];

  // Category
  if (product.category) {
    tags.push(product.category.charAt(0).toUpperCase() + product.category.slice(1));
  }

  // Tags from product
  if (product.tags) {
    product.tags.forEach(tag => {
      if (['Grain-Free', 'High Protein', 'Natural', 'Hypoallergenic'].includes(tag.name)) {
        tags.push(tag.name);
      }
    });
  }

  return tags;
}
