'use client';

import React from 'react';
import Head from 'next/head';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageHero } from '@/components/layout/PageHero';
import { PageSEO } from '@/components/seo';
import { useState, Suspense, useEffect } from 'react';
import { useProducts } from '@/lib/queries/products';
import { Product } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { getScoreColor } from '@/scoring/calculator';
import { formatPrice } from '@/lib/utils/format';
import { X, Plus, Search, Check, RotateCcw, Share2, Copy } from 'lucide-react';
import { Loading } from '@/components/ui/Loading';
import { useComparison } from '@/components/context/UIContext';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically import heavy comparison table
const ComparisonTable = dynamic(() => import('@/components/ui/ComparisonTable').then(mod => ({ default: mod.ComparisonTable })), {
  loading: () => <div className="flex justify-center py-8"><Loading /></div>,
  ssr: false // Disable SSR for this component as it uses client-side state
});

export default function ComparePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [swapSlotIndex, setSwapSlotIndex] = useState<number | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [loadingSelected, setLoadingSelected] = useState(false);
  const [urlParsed, setUrlParsed] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);

  // Use global comparison state
  const { items: selectedProductIds, addItem, removeItem, canAddMore, clearItems } = useComparison();

  const { data: products, isLoading } = useProducts({
    search: searchQuery,
    limit: 50,
  });

  // Fetch selected products by their IDs whenever the selected IDs change
  React.useEffect(() => {
    const fetchSelectedProducts = async () => {
      if (selectedProductIds.length === 0) {
        setSelectedProducts([]);
        return;
      }

      setLoadingSelected(true);
      try {
        const response = await fetch('/api/compare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productIds: selectedProductIds }),
        });

        if (response.ok) {
          const data = await response.json();
          setSelectedProducts(data);
        }
      } catch (error) {
        console.error('Error fetching selected products:', error);
      } finally {
        setLoadingSelected(false);
      }
    };

    fetchSelectedProducts();
  }, [selectedProductIds]);

  // Parse URL params on initial load
  useEffect(() => {
    if (urlParsed) return;

    const productsParam = searchParams.get('products');
    if (productsParam) {
      const slugs = productsParam.split(',').filter(Boolean);
      if (slugs.length > 0) {
        // Fetch products by slugs to get IDs
        fetch('/api/products?' + new URLSearchParams({ slugs: slugs.join(','), limit: '3' }))
          .then(res => res.json())
          .then(data => {
            if (data.data && Array.isArray(data.data)) {
              // Clear existing items first
              clearItems();
              // Add products from URL
              data.data.slice(0, 3).forEach((product: Product) => {
                addItem(product.id);
              });
            }
          })
          .catch(err => console.error('Error loading products from URL:', err));
      }
    }
    setUrlParsed(true);
  }, [searchParams, urlParsed, addItem, clearItems]);

  // Update URL when products change
  useEffect(() => {
    if (!urlParsed) return; // Don't update URL during initial parse

    if (selectedProducts.length > 0) {
      const slugs = selectedProducts.map(p => p.slug).join(',');
      router.push(`/compare?products=${slugs}`, { scroll: false });
    } else {
      router.push('/compare', { scroll: false });
    }
  }, [selectedProducts, router, urlParsed]);

  const handleAddProduct = (product: Product) => {
    if (swapSlotIndex !== null) {
      // Swap mode: replace product at specific index
      const currentProductAtSlot = selectedProducts[swapSlotIndex];
      if (currentProductAtSlot) {
        removeItem(currentProductAtSlot.id);
      }
      addItem(product.id);
      setSwapSlotIndex(null);
    } else if (canAddMore) {
      // Normal add mode
      addItem(product.id);
    }
    setShowProductSelector(false);
    setSearchQuery('');
  };

  const handleReset = () => {
    clearItems();
    setSelectedProducts([]);
    setShowProductSelector(false);
    setSearchQuery('');
    setSwapSlotIndex(null);
  };

  const handleRemoveProduct = (productId: string) => {
    removeItem(productId);
  };

  const handleSwapProduct = (index: number) => {
    setSwapSlotIndex(index);
    setShowProductSelector(true);
  };

  const handleCopyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const filteredProducts = products?.data?.filter(product =>
    !selectedProductIds.includes(product.id)
  ) || [];

  // Generate dynamic SEO meta tags
  const generateMetaTags = () => {
    if (selectedProducts.length === 0) {
      return {
        title: 'Compare Dog Foods - Side-by-Side Analysis',
        description: 'Compare up to 3 dog food products side-by-side with detailed nutritional analysis, pricing, and ratings.',
      };
    }

    const productNames = selectedProducts.map(p => p.name).join(' vs ');
    const winner = selectedProducts.reduce((best, current) =>
      (current.overall_score || 0) > (best.overall_score || 0) ? current : best
    );

    return {
      title: `Compare: ${productNames} | Dog Food Comparison 2026`,
      description: `${productNames} comparison: ${winner.name} leads with ${Math.round(winner.overall_score || 0)}/100 score. See detailed nutritional analysis, ingredients, and pricing.`,
    };
  };

  const metaTags = generateMetaTags();

  // Update document title dynamically
  useEffect(() => {
    document.title = metaTags.title;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', metaTags.description);
    }

    // Update og:title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', metaTags.title);
    }

    // Update og:description
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', metaTags.description);
    }
  }, [metaTags.title, metaTags.description]);

  // Generate structured data for products
  const generateStructuredData = () => {
    if (selectedProducts.length === 0) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Dog Food Product Comparison',
      description: metaTags.description,
      numberOfItems: selectedProducts.length,
      itemListElement: selectedProducts.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: product.name,
          brand: {
            '@type': 'Brand',
            name: product.brand?.name || 'Unknown',
          },
          image: product.image_url,
          description: `${product.name} dog food - Overall score: ${product.overall_score}/100`,
          aggregateRating: product.overall_score ? {
            '@type': 'AggregateRating',
            ratingValue: (product.overall_score / 20).toFixed(1), // Convert to 5-star scale
            bestRating: '5',
            worstRating: '1',
          } : undefined,
          offers: product.price_gbp ? {
            '@type': 'Offer',
            price: product.price_gbp,
            priceCurrency: 'GBP',
            availability: 'https://schema.org/InStock',
          } : undefined,
        },
      })),
    };
  };

  const structuredData = generateStructuredData();

  return (
    <>
      {/* Structured Data */}
      {structuredData && (
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
        </Head>
      )}

      <div className="flex min-h-screen flex-col bg-[var(--color-background-neutral)]">
        <Header />

        <PageSEO
          title={metaTags.title}
          description={metaTags.description}
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
          <div className="rounded-lg p-6 mb-8 border bg-[var(--color-background-card)] border-[var(--color-border)] shadow-[var(--shadow-small)]">
            <h2 className="text-2xl font-normal mb-2 text-[var(--color-text-primary)]">How to compare products</h2>
            <p className="text-[var(--color-text-secondary)] text-base">
              Select up to 3 dog food products to compare them side-by-side. You'll see detailed nutritional information,
              pricing, ratings, and ingredient analysis to help you make an informed decision.
            </p>
          </div>

          {/* Selected Products */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-normal text-[var(--color-text-primary)]">
                Selected products ({selectedProductIds.length}/3)
              </h2>
              <div className="flex items-center gap-3">
                {selectedProductIds.length > 1 && (
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg transition-all bg-[var(--color-background-card)] text-[var(--color-text-primary)] border-2 border-[var(--color-border)] hover:border-[var(--color-trust)] hover:bg-[var(--color-trust-bg)] shadow-[var(--shadow-small)] font-bold"
                    title="Copy comparison link"
                    aria-label="Copy shareable comparison link to clipboard"
                  >
                    <Copy className="w-5 h-5" aria-hidden="true" />
                    Copy Link
                  </button>
                )}
                {selectedProductIds.length > 0 && (
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg transition-all bg-[var(--color-background-card)] text-[var(--color-text-primary)] border-2 border-[var(--color-border)] hover:border-[var(--color-trust)] hover:bg-[var(--color-trust-bg)] shadow-[var(--shadow-small)] font-bold"
                    aria-label={`Reset comparison - remove all ${selectedProductIds.length} selected products`}
                  >
                    <RotateCcw className="w-5 h-5" aria-hidden="true" />
                    Reset
                  </button>
                )}
                {canAddMore && (
                  <button
                    onClick={() => setShowProductSelector(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg transition-all bg-[var(--color-trust)] text-[var(--color-background-card)] hover:opacity-90 shadow-[var(--shadow-medium)] font-bold"
                    aria-label={`Add product to comparison - ${selectedProductIds.length} of 3 selected`}
                  >
                    <Plus className="w-5 h-5" aria-hidden="true" />
                    Add product
                  </button>
                )}
              </div>
            </div>

            {/* Product Slots */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }, (_, index) => {
                const product = selectedProducts[index];
                return (
                  <div
                    key={index}
                    className={`border-2 border-dashed rounded-lg p-6 text-center min-h-[300px] flex flex-col items-center justify-center transition-all ${
                      product
                        ? 'border-[var(--color-border)] bg-[var(--color-background-card)] shadow-[var(--shadow-small)]'
                        : 'border-[var(--color-border)] bg-[var(--color-trust-bg)] hover:bg-[var(--color-trust-light)] hover:border-[var(--color-trust)] cursor-pointer'
                    }`}
                    onClick={() => !product && setShowProductSelector(true)}
                    role={product ? "article" : "button"}
                    aria-label={product ? `Comparison slot ${index + 1}: ${product.name} by ${product.brand?.name}, score ${product.overall_score}` : `Empty comparison slot ${index + 1} of 3, click to add product`}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveProduct(product.id);
                            }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
                            aria-label={`Remove ${product.name}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <h3 className="font-bold text-[var(--color-text-primary)] text-sm mb-1 line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-xs text-[var(--color-text-secondary)] mb-2">{product.brand?.name}</p>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold text-white ${getScoreColor(product.overall_score || 0)}`}>
                          {product.overall_score || 0}
                        </div>
                        <div className="flex items-center gap-2 mt-3 w-full">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSwapProduct(index);
                            }}
                            className="flex-1 px-3 py-1.5 bg-[var(--color-background-card)] text-[var(--color-trust)] border border-[var(--color-trust)] rounded-md text-xs font-medium hover:bg-[var(--color-trust-bg)] transition-colors flex items-center justify-center gap-1.5"
                            aria-label={`Swap ${product.name}`}
                          >
                            <RotateCcw className="w-3 h-3" />
                            Swap
                          </button>
                          {product.affiliate_url && (
                            <a
                              href={product.affiliate_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 px-3 py-1.5 bg-[var(--color-success)] text-white rounded-md text-xs font-medium hover:bg-[var(--color-success-dark)] transition-colors flex items-center justify-center gap-1.5"
                              aria-label={`Buy ${product.name} - opens in new tab`}
                            >
                              Buy Now
                            </a>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-[var(--shadow-small)]">
                          <Plus className="w-8 h-8 text-[var(--color-trust)]" />
                        </div>
                        <p className="text-[var(--color-text-secondary)] text-sm font-bold">Click to add product</p>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-1">Slot {index + 1} of 4</p>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Comparison Table */}
          {loadingSelected ? (
            <div className="flex justify-center py-12">
              <Loading size="lg" text="Loading comparison data..." />
            </div>
          ) : selectedProducts.length > 0 ? (
            <Suspense fallback={<div className="flex justify-center py-8"><Loading /></div>}>
              <ComparisonTable selectedProducts={selectedProducts} />
            </Suspense>
          ) : null}

          {/* Product Selector Modal */}
          {showProductSelector && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-[var(--color-background-card)] rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-[var(--shadow-large)]">
                <div className="p-6 border-b border-[var(--color-border)]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-normal text-[var(--color-text-primary)]">Select a product to compare</h3>
                    <button
                      onClick={() => {
                        setShowProductSelector(false);
                        setSwapSlotIndex(null);
                      }}
                      className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                      aria-label="Close product selector"
                    >
                      <X className="w-6 h-6" aria-hidden="true" />
                    </button>
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-secondary)] w-5 h-5" aria-hidden="true" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      className="w-full pl-11 pr-4 py-3 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-trust)] focus:border-[var(--color-trust)] text-[var(--color-text-primary)] bg-[var(--color-background-card)]"
                      aria-label="Search dog food products"
                    />
                  </div>
                </div>

                <div className="p-6 max-h-96 overflow-y-auto">
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loading size="lg" text="Loading products..." />
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-[var(--color-text-secondary)] text-base">No products found. Try a different search term.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredProducts.slice(0, 20).map((product) => (
                        <div
                          key={product.id}
                          className="border border-[var(--color-border)] rounded-lg p-4 hover:border-[var(--color-trust)] hover:bg-[var(--color-trust-bg)] cursor-pointer transition-all shadow-[var(--shadow-small)] hover:shadow-[var(--shadow-medium)]"
                          onClick={() => handleAddProduct(product)}
                          role="button"
                          tabIndex={0}
                          aria-label={`Add ${product.name} by ${product.brand?.name} to comparison - Score: ${product.overall_score}/100`}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleAddProduct(product);
                            }
                          }}
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
                              <h4 className="font-bold text-[var(--color-text-primary)] text-sm line-clamp-1">
                                {product.name}
                              </h4>
                              <p className="text-xs text-[var(--color-text-secondary)] font-bold">{product.brand?.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold text-white ${getScoreColor(product.overall_score || 0)}`}>
                                  {product.overall_score || 0}
                                </span>
                                <span className="text-xs text-[var(--color-text-secondary)]">
                                  {product.price_gbp ? formatPrice(product.price_gbp) : 'Price TBA'}
                                </span>
                              </div>
                            </div>
                            <Check className="w-5 h-5 text-[var(--color-trust)]" />
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

      {/* Copy Link Toast */}
      {showCopyToast && (
        <div className="fixed bottom-8 right-8 bg-[var(--color-trust)] text-white px-6 py-3 rounded-lg shadow-[var(--shadow-large)] flex items-center gap-2 animate-fade-in z-50">
          <Check className="w-5 h-5" />
          <span className="font-bold">Link copied to clipboard!</span>
        </div>
      )}
      </div>
    </>
  );
}
