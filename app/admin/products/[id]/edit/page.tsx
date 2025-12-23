'use client';

import { useState, useEffect } from 'react';
import { Container } from '@/components/layout/Container';
import { Brand, Product } from '@/types';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: Props) {
  const router = useRouter();
  const [productId, setProductId] = useState<string>('');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    brand_id: '',
    category: 'dry',
    sub_category: '',
    image_url: '',
    package_size_g: '',
    price_gbp: '',
    price_per_kg_gbp: '',
    affiliate_url: '',
    discount_code: '',
    discount_description: '',
    tags: [] as string[],

    protein_percent: '',
    fat_percent: '',
    fiber_percent: '',
    moisture_percent: '',
    ash_percent: '',
    calories_per_100g: '',
    meat_content_percent: '',

    ingredients_raw: '',

    meta_description: '',
    is_sponsored: false,
    is_available: true,
  });

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

        setAuthenticated(true);

        // If authenticated, proceed with initialization
        const { id } = await params;
        setProductId(id);
        await Promise.all([fetchProduct(id), fetchBrands(), fetchTags()]);
      } catch (error) {
        console.error('Error loading page data:', error);
        setErrors({ general: error instanceof Error ? error.message : 'Failed to load product data' });
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndInit();
  }, [params, router]);

  const fetchProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch product: ${response.status}`);
      }
      const data = await response.json();

      // Check if the response contains an error
      if (data && data.error) {
        throw new Error(data.error);
      }

      // Check if product data exists
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid product data received');
      }

      // Ensure required fields exist
      if (!data.id || !data.name) {
        throw new Error('Product data is missing required fields');
      }

      const product: Product = data;

      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        brand_id: product.brand_id || '',
        category: product.category || 'dry',
        sub_category: product.sub_category || '',
        image_url: product.image_url || '',
        package_size_g: product.package_size_g?.toString() || '',
        price_gbp: product.price_gbp?.toString() || '',
        price_per_kg_gbp: product.price_per_kg_gbp?.toString() || '',
        affiliate_url: product.affiliate_url || '',
        discount_code: product.discount_code || '',
        discount_description: product.discount_description || '',
        tags: product.tags?.map(tag => tag.id) || [],

        protein_percent: product.protein_percent?.toString() || '',
        fat_percent: product.fat_percent?.toString() || '',
        fiber_percent: product.fiber_percent?.toString() || '',
        moisture_percent: product.moisture_percent?.toString() || '',
        ash_percent: product.ash_percent?.toString() || '',
        calories_per_100g: product.calories_per_100g?.toString() || '',
        meat_content_percent: product.meat_content_percent?.toString() || '',

        ingredients_raw: product.ingredients_raw || '',

        meta_description: product.meta_description || '',
        is_sponsored: product.is_sponsored || false,
        is_available: product.is_available ?? true,
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error; // Re-throw to be caught by useEffect
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/brands', {
        credentials: 'include'
      });
      const data = await response.json();
      setBrands(data);
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags', {
        credentials: 'include'
      });
      const data = await response.json();
      setTags(data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    if (!formData.brand_id) newErrors.brand_id = 'Brand is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...formData,
        package_size_g: formData.package_size_g ? parseFloat(formData.package_size_g) : null,
        price_gbp: formData.price_gbp ? parseFloat(formData.price_gbp) : null,
        price_per_kg_gbp: formData.price_per_kg_gbp ? parseFloat(formData.price_per_kg_gbp) : null,
        protein_percent: formData.protein_percent ? parseFloat(formData.protein_percent) : null,
        fat_percent: formData.fat_percent ? parseFloat(formData.fat_percent) : null,
        fiber_percent: formData.fiber_percent ? parseFloat(formData.fiber_percent) : null,
        moisture_percent: formData.moisture_percent ? parseFloat(formData.moisture_percent) : null,
        ash_percent: formData.ash_percent ? parseFloat(formData.ash_percent) : null,
        calories_per_100g: formData.calories_per_100g ? parseFloat(formData.calories_per_100g) : null,
        meat_content_percent: formData.meat_content_percent ? parseFloat(formData.meat_content_percent) : null,
      };

      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert('Product updated successfully!');
        router.push('/admin/products');
      } else {
        const error = await response.json();
        alert(`Failed to update product: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-8">
        <div className="text-center py-20">
          <Loader2 size={48} className="animate-spin mx-auto text-blue-600" />
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="mb-6">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4"
        >
          <ArrowLeft size={20} />
          Back to Products
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Product</h1>
        <p className="text-gray-600">Update product information</p>
      </div>

      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-800 font-semibold">Error</p>
          <p className="text-red-700">{errors.general}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* All the same sections as the new product form */}
        {/* Basic Information */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-2xl">📋</span>
            Basic Information
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Slug *
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.slug ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.slug && <p className="text-red-600 text-sm mt-1">{errors.slug}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Brand *
              </label>
              <select
                name="brand_id"
                value={formData.brand_id}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.brand_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a brand</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
              {errors.brand_id && <p className="text-red-600 text-sm mt-1">{errors.brand_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="dry">Dry Food</option>
                <option value="wet">Wet Food</option>
                <option value="snack">Snacks</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sub Category
              </label>
              <input
                type="text"
                name="sub_category"
                value={formData.sub_category}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tags
              </label>
              <div className="grid grid-cols-2 gap-2">
                {tags.map((tag) => (
                  <label key={tag.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.tags.includes(tag.id)}
                      onChange={(e) => {
                        const newTags = e.target.checked
                          ? [...formData.tags, tag.id]
                          : formData.tags.filter(id => id !== tag.id);
                        setFormData({ ...formData, tags: newTags });
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm" style={{ color: tag.color }}>{tag.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 justify-end">
          <Link
            href="/admin/products"
            className="px-8 py-4 border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={20} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </Container>
  );
}
