'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageHero } from '@/components/layout/PageHero';
import { PageSEO } from '@/components/seo';
import { useState, Suspense } from 'react';
import { useProducts } from '@/lib/queries/products';
import { Product } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { getScoreColor } from '@/scoring/calculator';
import { formatPrice } from '@/lib/utils/format';
import { X, Plus, Search, Check } from 'lucide-react';
import { Loading } from '@/components/ui/Loading';
import { useComparison } from '@/components/context/UIContext';
import dynamic from 'next/dynamic';

// Dynamically import heavy comparison table
const ComparisonTable = dynamic(() => import('@/components/ui/ComparisonTable').then(mod => ({ default: mod.ComparisonTable })), {
  loading: () => <div className="flex justify-center py-8"><Loading /></div>,
  ssr: false // Disable SSR for this component as it uses client-side state
});

export default function ComparePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showProductSelector, setShowProductSelector] = useState(false);

  // Use global comparison state
  const { items: selectedProductIds, addItem, removeItem, canAddMore } = useComparison();

  const { data: products, isLoading } = useProducts({
    search: searchQuery,
    limit: 50,
  });

  // Get full product objects for selected items
  const selectedProducts = products?.data?.filter(product =>
    selectedProductIds.includes(product.id)
  ) || [];

  const handleAddProduct = (product: Product) => {
    if (canAddMore) {
      addItem(product.id);
    }
    setShowProductSelector(false);
    setSearchQuery('');
  };

  const handleRemoveProduct = (productId: string) => {
    removeItem(productId);
  };

  const filteredProducts = products?.data?.filter(product =>
    !selectedProductIds.includes(product.id)
  ) || [];

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background-neutral)]">
      <Header />

      <PageSEO
        title="Compare Dog Foods - Side-by-Side Analysis"
        description="Compare up to 4 dog food products side-by-side with detailed nutritional analysis, pricing, and ratings."
        canonicalUrl="/compare"
      />

      <PageHero
        title="Compare dog foods"
        description="Side-by-side analysis of nutritional content and pricing"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Compare', href: '/compare' },
        ]}
      />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Instructions */}
          <div className="rounded-lg p-6 mb-8 border bg-[var(--color-background-card)] border-[var(--color-border)]">
            <h2 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">How to compare products</h2>
            <p className="text-[var(--color-text-secondary)]">
              Select up to 4 dog food products to compare them side-by-side. You'll see detailed nutritional information,
              pricing, ratings, and ingredient analysis to help you make an informed decision.
            </p>
          </div>

          {/* Selected Products */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
                Selected products ({selectedProductIds.length}/4)
              </h2>
              {canAddMore && (
                <button
                  onClick={() => setShowProductSelector(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors bg-[var(--color-trust)] text-[var(--color-background-card)] hover:opacity-90"
                >
                  <Plus className="w-4 h-4" />
                  Add product
                </button>
              )}
            </div>

            {/* Product Slots */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }, (_, index) => {
                const product = selectedProducts[index];
                return (
                  <div
                    key={index}
                    className={`border-2 border-dashed rounded-lg p-6 text-center min-h-[300px] flex flex-col items-center justify-center ${
                      product ? 'border-gray-300' : 'border-gray-300 bg-gray-50'
                    }`}
                  >
                    {product ? (
                      <>
                        <div className="relative w-20 h-20 mb-4">
                          <Image
                            src={product.image_url || 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z'}
                            alt={product.name}
                            fill
                            className="object-cover rounded"
                            sizes="80px"
                          />
                          <button
                            onClick={() => handleRemoveProduct(product.id)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-600 mb-2">{product.brand?.name}</p>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold text-white ${getScoreColor(product.overall_score || 0)}`}>
                          {product.overall_score || 0}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                          <Plus className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm">Empty slot</p>
                        <button
                          onClick={() => setShowProductSelector(true)}
                          className="mt-2 text-primary hover:text-primary-hover text-sm font-medium"
                        >
                          Add product
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Comparison Table */}
          {selectedProducts.length > 0 && (
            <Suspense fallback={<div className="flex justify-center py-8"><Loading /></div>}>
              <ComparisonTable selectedProducts={selectedProducts} />
            </Suspense>
          )}

          {/* Product Selector Modal */}
          {showProductSelector && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Select a Product to Compare</h3>
                    <button
                      onClick={() => setShowProductSelector(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Search */}
                  <div className="mt-4 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ring focus:border-ring"
                    />
                  </div>
                </div>

                <div className="p-6 max-h-96 overflow-y-auto">
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loading size="lg" text="Loading products..." />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredProducts.slice(0, 20).map((product) => (
                        <div
                          key={product.id}
                          className="border border-gray-200 rounded-lg p-4 hover:border-secondary cursor-pointer transition-colors"
                          onClick={() => handleAddProduct(product)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 relative flex-shrink-0">
                              <Image
                                src={product.image_url || 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z'}
                                alt={product.name}
                                fill
                                className="object-cover rounded"
                                sizes="48px"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                                {product.name}
                              </h4>
                              <p className="text-xs text-gray-600">{product.brand?.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold text-white ${getScoreColor(product.overall_score || 0)}`}>
                                  {product.overall_score || 0}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {product.price_gbp ? formatPrice(product.price_gbp) : 'Price TBA'}
                                </span>
                              </div>
                            </div>
                            <Check className="w-5 h-5 text-green-600" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
