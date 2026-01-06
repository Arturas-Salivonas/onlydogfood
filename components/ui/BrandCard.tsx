import Link from 'next/link';
import Image from 'next/image';
import { Brand } from '@/types';
import { getScoreColor } from '@/scoring/calculator';

interface BrandCardProps {
  brand: Brand;
}

export function BrandCard({ brand }: BrandCardProps) {
  const scoreInfo = brand.overall_score ? getScoreColor(brand.overall_score) : null;

  return (
    <Link href={`/brands/${brand.slug}`} className="block h-full">
      <div className="group h-full rounded-lg transition-all border bg-[var(--color-background-card)] border-[var(--color-border)] shadow-[var(--shadow-small)] hover:shadow-[var(--shadow-medium)]">
        {/* Sponsored Badge */}
        {brand.is_sponsored && (
          <div className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full mb-4 border bg-[var(--color-caution-bg)] text-[var(--color-text-primary)] border-[var(--color-caution)]">
            <span className="text-sm">⭐</span>
            Sponsored
          </div>
        )}

        {/* Brand Logo */}
        <div className="flex items-center justify-center h-24 mb-5 rounded-lg p-4 transition-all border bg-[var(--color-background-neutral)] border-[var(--color-border)] group-hover:bg-[var(--color-trust-bg)]">
          {brand.logo_url ? (
            <div className="relative w-full h-full">
              <Image
                src={brand.logo_url}
                alt={brand.name}
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <span className="text-4xl">🏷️</span>
          )}
        </div>

        {/* Brand Name */}
        <h3 className="font-bold text-xl text-center mb-2 transition-colors text-[var(--color-text-primary)]">
          {brand.name}
        </h3>

        {/* Description Preview */}
        {brand.description && (
          <p className="text-sm text-center mb-4 line-clamp-2 leading-relaxed text-[var(--color-text-secondary)]">
            {brand.description}
          </p>
        )}

        {/* Country */}
        {brand.country_of_origin && (
          <div className="flex items-center justify-center gap-1 mb-4">
            <span className="text-sm">🌍</span>
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">
              {brand.country_of_origin}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-around pt-4 border-t border-[var(--color-border)]">
          {/* Score */}
          {scoreInfo && brand.overall_score && (
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${scoreInfo.bgColor} mb-2 border shadow-[var(--shadow-small)] border-[var(--color-border)]`}>
                <span className={`font-bold text-lg ${scoreInfo.color}`}>
                  {Math.round(brand.overall_score)}
                </span>
              </div>
              <p className="text-xs font-semibold text-[var(--color-text-secondary)]">Score</p>
            </div>
          )}

          {/* Product Count */}
          <div className="text-center">
            <p className="text-2xl font-bold mb-1 text-[var(--color-text-primary)]">{brand.total_products}</p>
            <p className="text-xs font-semibold text-[var(--color-text-secondary)]">Products</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
