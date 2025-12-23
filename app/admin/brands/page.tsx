'use client';

import { useState, useEffect } from 'react';
import { Container } from '@/components/layout/Container';
import { Brand } from '@/types';
import { useRouter } from 'next/navigation';
import { Search, Edit, Trash2, Plus } from 'lucide-react';
import Link from 'next/link';

export default function BrandsManagementPage() {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const checkAuthAndInit = async () => {
      try {
        // Check authentication first
        const authResponse = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        if (!authResponse.ok) {
          router.push('/admin/login');
          return;
        }

        // If authenticated, fetch data
        await fetchBrands();
      } catch (error) {
        console.error('Error loading page data:', error);
      }
    };

    checkAuthAndInit();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/brands', {
        credentials: 'include'
      });
      const data = await response.json();
      setBrands(data);
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this brand? This will also delete all associated products.')) return;

    try {
      const response = await fetch(`/api/admin/brands/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setBrands(brands.filter((b) => b.id !== id));
        alert('Brand deleted successfully');
      } else {
        alert('Failed to delete brand');
      }
    } catch (error) {
      console.error('Error deleting brand:', error);
      alert('Error deleting brand');
    }
  };

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <Container>
        <div className="text-center py-12">Loading brands...</div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Brands</h1>
          <p className="text-gray-600">Manage dog food brands</p>
        </div>
        <Link
          href="/admin/brands/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          <Plus size={20} />
          Add Brand
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brands..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredBrands.length} of {brands.length} brands
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBrands.length > 0 ? (
          filteredBrands.map((brand) => (
            <div
              key={brand.id}
              className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {brand.name}
                  </h3>
                  {brand.country_of_origin && (
                    <p className="text-sm text-gray-500">
                      📍 {brand.country_of_origin}
                    </p>
                  )}
                </div>
                {brand.overall_score && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.round(brand.overall_score)}
                    </div>
                    <div className="text-xs text-gray-500">Score</div>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <div className="text-sm text-gray-600">
                  <strong>{brand.total_products}</strong> products
                </div>
              </div>

              {brand.is_sponsored && (
                <div className="mb-4">
                  <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">
                    ⭐ Sponsored
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/brands/${brand.id}/edit`}
                  className="flex-1 text-center px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md font-medium text-sm transition-colors"
                >
                  <Edit size={16} className="inline mr-1" />
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(brand.id)}
                  className="flex-1 text-center px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-md font-medium text-sm transition-colors"
                >
                  <Trash2 size={16} className="inline mr-1" />
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            No brands found
          </div>
        )}
      </div>
    </Container>
  );
}
