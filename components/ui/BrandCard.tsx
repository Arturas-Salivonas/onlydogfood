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
      <div className="group h-full bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-blue-300">
        {/* Sponsored Badge */}
        {brand.is_sponsored && (
          <div className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4 shadow-md border border-amber-400/20">
            <span className="text-sm">⭐</span>
            SPONSORED
          </div>
        )}

        {/* Brand Logo */}
        <div className="flex items-center justify-center h-24 mb-5 bg-gray-50 rounded-lg p-4 group-hover:bg-blue-50 group-hover:scale-105 transition-all duration-300 border border-gray-100">
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
        <h3 className="font-bold text-xl text-gray-900 text-center mb-2 group-hover:text-blue-600 transition-colors">
          {brand.name}
        </h3>

        {/* Description Preview */}
        {brand.description && (
          <p className="text-sm text-gray-600 text-center mb-4 line-clamp-2 leading-relaxed">
            {brand.description}
          </p>
        )}

        {/* Country */}
        {brand.country_of_origin && (
          <div className="flex items-center justify-center gap-1 mb-4">
            <span className="text-sm">🌍</span>
            <p className="text-sm text-gray-600 font-medium">
              {brand.country_of_origin}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-around pt-4 border-t border-gray-100">
          {/* Score */}
          {scoreInfo && brand.overall_score && (
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${scoreInfo.bgColor} mb-2 shadow-sm border border-white`}>
                <span className={`font-bold text-lg ${scoreInfo.color}`}>
                  {Math.round(brand.overall_score)}
                </span>
              </div>
              <p className="text-xs text-gray-600 font-semibold">Score</p>
            </div>
          )}

          {/* Product Count */}
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 mb-1">{brand.total_products}</p>
            <p className="text-xs text-gray-600 font-semibold">Products</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
