'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { getScoreColor } from '@/scoring/calculator';
import { formatPrice } from '@/lib/utils/format';

interface ComparisonTableProps {
  selectedProducts: Product[];
}

export function ComparisonTable({ selectedProducts }: ComparisonTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
              {selectedProducts.map((product) => (
                <th key={product.id} className="px-6 py-4 text-center text-sm font-semibold text-gray-900 min-w-[200px]">
                  <Link
                    href={`/dog-food/${product.slug}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {product.name}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {/* Price */}
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">Price</td>
              {selectedProducts.map((product) => (
                <td key={product.id} className="px-6 py-4 text-center text-sm text-gray-900">
                  {product.price_gbp ? formatPrice(product.price_gbp) : 'N/A'}
                </td>
              ))}
            </tr>

            {/* Overall Score */}
            <tr className="bg-gray-50">
              <td className="px-6 py-4 text-sm font-medium text-gray-900">Overall Score</td>
              {selectedProducts.map((product) => (
                <td key={product.id} className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold text-white ${getScoreColor(product.overall_score || 0)}`}>
                    {product.overall_score || 0}/100
                  </span>
                </td>
              ))}
            </tr>

            {/* Nutrition Score */}
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">Nutrition Score</td>
              {selectedProducts.map((product) => (
                <td key={product.id} className="px-6 py-4 text-center text-sm text-gray-900">
                  {product.nutrition_score ? `${product.nutrition_score}/100` : 'N/A'}
                </td>
              ))}
            </tr>

            {/* Ingredients Score */}
            <tr className="bg-gray-50">
              <td className="px-6 py-4 text-sm font-medium text-gray-900">Ingredients Score</td>
              {selectedProducts.map((product) => (
                <td key={product.id} className="px-6 py-4 text-center text-sm text-gray-900">
                  {product.ingredient_score ? `${product.ingredient_score}/100` : 'N/A'}
                </td>
              ))}
            </tr>

            {/* Value Score */}
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">Value Score</td>
              {selectedProducts.map((product) => (
                <td key={product.id} className="px-6 py-4 text-center text-sm text-gray-900">
                  {product.value_score ? `${product.value_score}/100` : 'N/A'}
                </td>
              ))}
            </tr>

            {/* Brand */}
            <tr className="bg-gray-50">
              <td className="px-6 py-4 text-sm font-medium text-gray-900">Brand</td>
              {selectedProducts.map((product) => (
                <td key={product.id} className="px-6 py-4 text-center text-sm text-gray-900">
                  {product.brand?.name || 'N/A'}
                </td>
              ))}
            </tr>

            {/* Product Image */}
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">Product</td>
              {selectedProducts.map((product) => (
                <td key={product.id} className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <Image
                      src={product.image_url || 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z'}
                      alt={product.name}
                      width={60}
                      height={60}
                      className="object-cover rounded"
                    />
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}