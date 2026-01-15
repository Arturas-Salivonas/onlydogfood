'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { useComparison } from '@/components/context/UIContext';
import { Check, Plus } from 'lucide-react';
import { ProtectionIcon } from './ProtectionIcon';
import { formatPrice } from '@/lib/utils/format';

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

  // Check if product is a safe first choice
  const isSafeFirstChoice = (product.overall_score || 0) >= 60 &&
    !product.red_flag_override;

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

      <div className="h-full rounded-lg overflow-hidden transition-all flex flex-col bg-[var(--color-background-card)] border-[var(--color-border)] shadow-[var(--shadow-small)] hover:shadow-[var(--shadow-medium)] border">

        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-[var(--color-background-neutral)]">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-contain p-4 transition-transform duration-500"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-[var(--color-text-secondary)]">
              <span className="text-7xl">🐕</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col flex-1 p-4">
          {/* Brand - Clickable */}
          {product.brand?.slug ? (
            <Link
              href={`/brands/${product.brand.slug}`}
              className="text-xs font-semibold mb-1 tracking-wide text-[var(--color-trust)] hover:underline w-fit"
              onClick={(e) => e.stopPropagation()}
            >
              {product.brand?.name}
            </Link>
          ) : (
            <p className="text-xs font-semibold mb-1 tracking-wide text-[var(--color-trust)]">
              {product.brand?.name}
            </p>
          )}

            {/* Product Name */}
            <h3 className="font-bold mb-3 line-clamp-2 text-base leading-tight text-[var(--color-text-primary)]">
              {product.name}
            </h3>

            {/* Safe First Choice Badge - Only show if applicable */}
            {isSafeFirstChoice && (
              <div className="mb-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs bg-[var(--color-trust)] text-[var(--color-background-card)] shadow-[var(--shadow-small)]">
                  <ProtectionIcon className="w-3.5 h-3.5" />
                  Safe First Choice
                </div>
              </div>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Price and Score Row */}
            <div className="flex items-end justify-between gap-3 pt-3 border-t border-[var(--color-border)]">
              {/* Price Per Meal */}
              {product.price_per_kg_gbp && (
                <div className="flex flex-col">
                  <span className="text-xs text-[var(--color-text-secondary)] mb-0.5">Price</span>
                  <span className="text-lg font-bold text-[var(--color-text-primary)]">
                    {formatPrice(product.price_per_kg_gbp * 0.15)} <span className="text-xs font-normal text-[var(--color-text-secondary)]">/ per meal</span>
                  </span>
                </div>
              )}

              {/* ODF Score Badge */}
              <div className="flex flex-col items-end">
                <span className="text-xs text-[var(--color-text-secondary)] mb-0.5">ODF Score</span>
                <div className="relative">
                  <div
                    className="px-3 py-1.5 rounded-lg font-bold text-lg shadow-[var(--shadow-medium)] transition-all"
                    style={{
                      background: (product.overall_score || 0) >= 80
                        ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                        : (product.overall_score || 0) >= 60
                        ? 'linear-gradient(135deg, #8FAF9F 0%, #7A9A8A 100%)'
                        : (product.overall_score || 0) >= 40
                        ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                        : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                      color: 'white',
                      border: 'none',
                    }}
                  >
                    {product.overall_score || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* View Details Link */}
          <Link
            href={`/dog-food/${product.slug}`}
            className="block px-4 py-3 text-center text-sm font-bold text-[var(--color-trust)] hover:bg-[var(--color-trust-bg)] transition-colors border-t border-[var(--color-border)]"
          >
            See ingredients & details
          </Link>
        </div>
    </div>
  );
}
