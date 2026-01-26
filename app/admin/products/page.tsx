'use client';

import { useState, useEffect } from 'react';
import { Container } from '@/components/layout/Container';
import { Product, Brand } from '@/types';
import { Search, Edit, Trash2, Plus, RefreshCw, Package } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils/format';
import { getScoreColor } from '@/lib/utils/scoring';

export default function ProductsManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [recalculating, setRecalculating] = useState(false);
  const [recalculatingId, setRecalculatingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 50;

  useEffect(() => {
    fetchProducts();
  }, [page, search, categoryFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) params.append('search', search);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);

      const response = await fetch(`/api/products?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }
      const data = await response.json();
      setProducts(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setProducts(products.filter((p) => p.id !== id));
        alert('Product deleted successfully');
      } else {
        alert('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  const handleRecalculateAll = async () => {
    if (!confirm('This will recalculate scores for ALL products. Continue?')) return;

    setRecalculating(true);
    try {
      const response = await fetch('/api/admin/products/recalculate-all', {
        method: 'POST',
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        alert(`✅ Success!\nRecalculated: ${result.successCount}\nErrors: ${result.errorCount}\nTotal: ${result.total}`);
        fetchProducts(); // Refresh the list
      } else {
        alert(`Failed to recalculate: ${result.error}`);
      }
    } catch (error) {
      console.error('Error recalculating:', error);
      alert('Error recalculating products');
    } finally {
      setRecalculating(false);
    }
  };

  const handleRecalculateOne = async (id: string, name: string) => {
    setRecalculatingId(id);
    try {
      const response = await fetch(`/api/admin/products/${id}/recalculate`, {
        method: 'POST',
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        alert(`✅ Recalculated "${name}"\n\nNew scores:\n• Overall: ${result.scores.overall.toFixed(1)}\n• Ingredient: ${result.scores.ingredient.toFixed(1)}\n• Nutrition: ${result.scores.nutrition.toFixed(1)}\n• Value: ${result.scores.value.toFixed(1)}`);
        fetchProducts(); // Refresh the list
      } else {
        alert(`Failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error recalculating:', error);
      alert('Error recalculating product');
    } finally {
      setRecalculatingId(null);
    }
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1); // Reset to first page on search
  };

  const handleCategoryChange = (category: string) => {
    setCategoryFilter(category);
    setPage(1); // Reset to first page on filter change
  };

  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, total);

  if (loading) {
    return (
      <Container>
        <div className="text-center py-12">Loading products...</div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Products</h1>
          <p className="text-gray-600">Manage your dog food products</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRecalculateAll}
            disabled={recalculating}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={20} className={recalculating ? 'animate-spin' : ''} />
            {recalculating ? 'Recalculating...' : 'Recalculate All'}
          </button>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            <Plus size={20} />
            Add Product
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search products or brands..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
            >
              Search
            </button>
            <select
              value={categoryFilter}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Categories</option>
              <option value="dry">Dry Food</option>
              <option value="wet">Wet Food</option>
              <option value="snack">Snacks</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {startIndex}-{endIndex} of {total} products
        </div>
        {totalPages > 1 && (
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 gap-4">
        {products.length > 0 ? (
          products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* Product Image */}
                <div className="flex-shrink-0">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      width={80}
                      height={80}
                      className="rounded-md object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center border border-gray-200">
                      <Package size={32} className="text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {product.brand?.name || 'No Brand'}
                      </p>
                    </div>

                    {/* Score Badge */}
                    <div
                      className={`flex-shrink-0 inline-flex flex-col items-center justify-center w-14 h-14 rounded-full ${
                        getScoreColor(product.overall_score || 0)
                      }`}
                    >
                      <span className="font-bold text-sm text-white leading-none">
                        {Math.round(product.overall_score || 0)}
                      </span>
                      <span className="text-[10px] text-white opacity-75 leading-none">/100</span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 text-sm mb-3">
                    <div>
                      <span className="text-gray-500">Category:</span>{' '}
                      <span className="font-medium capitalize">{product.category}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Price/kg:</span>{' '}
                      <span className="font-medium">
                        {product.price_per_kg_gbp
                          ? formatPrice(product.price_per_kg_gbp)
                          : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Protein:</span>{' '}
                      <span className="font-medium">{product.protein_percent?.toFixed(1) || 'N/A'}%</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>{' '}
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          product.is_available
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {product.is_available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>

                  {/* Scores Breakdown */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                      Ingredient: {product.ingredient_score?.toFixed(1) || 'N/A'}
                    </div>
                    <div className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                      Nutrition: {product.nutrition_score?.toFixed(1) || 'N/A'}
                    </div>
                    <div className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">
                      Value: {product.value_score?.toFixed(1) || 'N/A'}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRecalculateOne(product.id, product.name)}
                      disabled={recalculatingId === product.id}
                      className="inline-flex items-center gap-1.5 text-xs bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-md font-medium transition-colors disabled:opacity-50"
                      title="Recalculate score"
                    >
                      <RefreshCw size={14} className={recalculatingId === product.id ? 'animate-spin' : ''} />
                      {recalculatingId === product.id ? 'Calculating...' : 'Recalculate'}
                    </button>
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="inline-flex items-center gap-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-md font-medium transition-colors"
                    >
                      <Edit size={14} />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="inline-flex items-center gap-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-md font-medium transition-colors"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                    <Link
                      href={`/dog-food/${product.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md font-medium transition-colors ml-auto"
                    >
                      View Product →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center text-gray-500">
            No products found
          </div>
        )}
      </div>
    </Container>
  );
}
