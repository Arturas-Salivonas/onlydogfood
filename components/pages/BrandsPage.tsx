import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageHero } from '@/components/layout/PageHero';
import { PageSEO } from '@/components/seo';
import { useBrands } from '@/lib/queries/brands';
import { BrandCard } from '@/components/ui/BrandCard';
import { Loading } from '@/components/ui/Loading';
import { useState } from 'react';
import { CustomSelect } from '@/components/ui/CustomSelect';

export default function BrandsPage() {
  const [sort, setSort] = useState('score-desc');
  const [page, setPage] = useState(1);
  const { data: brands, total, page: currentPage, totalPages, isLoading, error } = useBrands(sort, page, 20);

  const handleSortChange = (sort: string) => {
    setSort(sort);
    setPage(1);
  };

  const handlePageChange = (page: number) => {
    setPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />

      <PageSEO
        title="Dog Food Brands - Compare Trusted Manufacturers"
        description="Browse and compare dog food brands with detailed analysis of their products, scoring methodology, and manufacturing practices."
        canonicalUrl="/brands"
      />

      <PageHero
        title="Dog Food Brands"
        description="Compare trusted manufacturers and their product lines"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Brands', href: '/brands' },
        ]}
      />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Sort Controls */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {total || 0} Brands Available
                </h2>
                <span className="text-sm text-gray-600">
                  Page {currentPage || 1} of {totalPages || 1}
                </span>
              </div>

              <CustomSelect
                value={sort}
                onChange={handleSortChange}
                options={[
                  { value: 'score-desc', label: 'Highest Rated' },
                  { value: 'score-asc', label: 'Lowest Rated' },
                  { value: 'name-asc', label: 'Name A-Z' },
                  { value: 'name-desc', label: 'Name Z-A' },
                ]}
                className="w-48"
              />
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center py-12">
              <Loading size="lg" text="Loading brands..." />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">Error loading brands. Please try again.</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          )}

          {/* Brands Grid */}
          {brands && brands.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {brands.map((brand) => (
                  <BrandCard key={brand.id} brand={brand} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-1 mt-12">
                  <button
                    onClick={() => handlePageChange((currentPage || 1) - 1)}
                    disabled={(currentPage || 1) <= 1}
                    className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>

                  <div className="flex items-center gap-1 mx-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, (currentPage || 1) - 2) + i;
                      if (pageNum > totalPages) return null;

                      const isActive = pageNum === (currentPage || 1);

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-4 py-3 border rounded-xl text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md ${
                            isActive
                              ? 'bg-blue-600 text-white border-blue-600 shadow-blue-100 hover:shadow-blue-200'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange((currentPage || 1) + 1)}
                    disabled={(currentPage || 1) >= totalPages}
                    className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Next
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {brands && brands.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-600">No brands found.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}