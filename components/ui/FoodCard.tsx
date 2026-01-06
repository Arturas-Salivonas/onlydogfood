'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { useComparison } from '@/components/context/UIContext';
import { Check, Plus } from 'lucide-react';
import { ScoreBadge } from '@/components/ui/ScoreDisplay';
import { PricePerFeedCompact } from '@/components/ui/PricePerFeed';
import { IngredientFlagsGroup, IngredientFlagType } from '@/components/ui/IngredientFlag';
import { FILLERS, ARTIFICIAL_ADDITIVES } from '@/scoring/config';

interface FoodCardProps {
  product: Product;
  showComparison?: boolean;
  ranking?: number;
}

export function FoodCard({
  product,
  showComparison = true,
  ranking,
}: FoodCardProps) {
  const { addItem, hasItem, canAddMore } = useComparison();
  const isInComparison = hasItem(product.id);

  const handleComparisonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isInComparison && canAddMore) {
      addItem(product.id);
    }
  };

  // Generate ingredient flags
  const ingredientFlags = generateIngredientFlags(product);

  // Get key tags
  const keyTags = getKeyTags(product);

  return (
    <div className="block h-full relative group">
      {/* Ranking Badge */}
      {ranking && (
        <div className="absolute top-3 left-3 z-20 font-bold text-lg w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-caution)] text-[var(--color-background-card)] shadow-[var(--shadow-medium)]">
          #{ranking}
        </div>
      )}

      {/* Comparison Button */}
      {showComparison && (
        <button
          onClick={handleComparisonClick}
          disabled={isInComparison || !canAddMore}
          className={`absolute top-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isInComparison
              ? 'bg-[var(--color-trust)] text-[var(--color-background-card)] shadow-[var(--shadow-medium)]'
              : canAddMore
              ? 'opacity-0 group-hover:opacity-100 shadow-[var(--shadow-medium)] bg-[var(--color-background-card)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              : 'bg-[var(--color-background-neutral)] text-[var(--color-text-secondary)] cursor-not-allowed opacity-0 group-hover:opacity-100'
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
        <div className="group h-full rounded-lg overflow-hidden transition-all flex flex-col bg-[var(--color-background-card)] border-[var(--color-border)] shadow-[var(--shadow-small)] hover:shadow-[var(--shadow-medium)] border">

          {/* Product Image */}
          <div className="relative aspect-square overflow-hidden bg-[var(--color-background-neutral)]">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-contain p-4 group- transition-transform duration-500"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-[var(--color-text-secondary)]">
                <span className="text-7xl">🐕</span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col flex-1 p-4">
            {/* Brand */}
            <p className="text-xs font-semibold mb-1 tracking-wide text-[var(--color-trust)]">
              {product.brand?.name}
            </p>

            {/* Product Name */}
            <h3 className="font-bold mb-3 line-clamp-2 text-base leading-tight text-[var(--color-text-primary)]">
              {product.name}
            </h3>

            {/* Score Badge */}
            <div className="mb-3">
              <ScoreBadge
                score={product.overall_score || 0}
                size="sm"
              />
            </div>

            {/* Key Tags */}
            {keyTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {keyTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-[var(--color-trust-bg)] text-[var(--color-text-primary)] border-[var(--color-trust)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Ingredient Flags */}
            {ingredientFlags.length > 0 && (
              <div className="mb-3">
                <IngredientFlagsGroup flags={ingredientFlags} maxDisplay={3} />
              </div>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Price Per Feed */}
            {product.price_per_kg_gbp && (
              <div className="mt-auto pt-3 border-t border-[var(--color-border)]">
                <PricePerFeedCompact pricePerKg={product.price_per_kg_gbp} />
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

// Helper function to generate ingredient flags
function generateIngredientFlags(product: Product): Array<{
  type: IngredientFlagType;
  label: string;
  reason?: string;
}> {
  const flags: Array<{ type: IngredientFlagType; label: string; reason?: string }> = [];
  const ingredientsText = product.ingredients_raw?.toLowerCase() || '';

  // Check for high meat content
  if (product.meat_content_percent && product.meat_content_percent >= 50) {
    flags.push({
      type: 'positive',
      label: `${product.meat_content_percent}% Meat`,
      reason: 'High meat content provides quality protein for your dog',
    });
  }

  // Check for fillers
  const hasFillers = FILLERS.some(filler => ingredientsText.includes(filler));
  if (hasFillers) {
    flags.push({
      type: 'warning',
      label: 'Contains Fillers',
      reason: 'Contains corn, wheat, or soy which are low-quality fillers',
    });
  } else if (ingredientsText.length > 0) {
    flags.push({
      type: 'positive',
      label: 'No Fillers',
      reason: 'Free from corn, wheat, and soy',
    });
  }

  // Check for artificial additives
  const hasAdditives = ARTIFICIAL_ADDITIVES.some(additive => ingredientsText.includes(additive));
  if (hasAdditives) {
    flags.push({
      type: 'negative',
      label: 'Artificial Additives',
      reason: 'Contains artificial colors, flavors, or preservatives',
    });
  }

  return flags;
}

// Helper function to get key tags
function getKeyTags(product: Product): string[] {
  const tags: string[] = [];

  // Add tags from product tags
  if (product.tags) {
    product.tags.forEach(tag => {
      if (['Grain-Free', 'Puppy', 'Senior', 'High Protein', 'Natural'].includes(tag.name)) {
        tags.push(tag.name);
      }
    });
  }

  // Add life stage from sub_category
  if (product.sub_category) {
    try {
      const subCategories = typeof product.sub_category === 'string'
        ? JSON.parse(product.sub_category)
        : product.sub_category;

      if (Array.isArray(subCategories)) {
        subCategories.forEach(cat => {
          if (['Puppy', 'Adult', 'Senior', 'All Life Stages'].includes(cat)) {
            if (!tags.includes(cat)) {
              tags.push(cat);
            }
          }
        });
      }
    } catch {
      // Ignore parsing errors
    }
  }

  return tags.slice(0, 3);
}
