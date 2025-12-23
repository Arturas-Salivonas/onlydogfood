'use client';

import { useState, useEffect } from 'react';
import { Container } from '@/components/layout/Container';
import { Brand } from '@/types';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
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

    // Nutritional data
    protein_percent: '',
    fat_percent: '',
    fiber_percent: '',
    moisture_percent: '',
    ash_percent: '',
    calories_per_100g: '',
    meat_content_percent: '',

    // Ingredients
    ingredients_raw: '',

    // Meta
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

        // If authenticated, fetch data
        await Promise.all([fetchBrands(), fetchTags()]);
      } catch (error) {
        console.error('Error loading page data:', error);
      }
    };

    checkAuthAndInit();
  }, [router]);

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/brands', {
        credentials: 'include'
      });
      const data = await response.json();
      setBrands(data);
    } catch (error) {
      console.error('Failed to fetch brands:', error);
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
      console.error('Failed to fetch tags:', error);
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

      // Auto-generate slug from name
      if (name === 'name' && !formData.slug) {
        const slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        setFormData((prev) => ({ ...prev, slug }));
      }
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    if (!formData.brand_id) newErrors.brand_id = 'Brand is required';
    if (!formData.category) newErrors.category = 'Category is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Convert string numbers to actual numbers
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

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert('Product created successfully!');
        router.push('/admin/products');
      } else {
        const error = await response.json();
        alert(`Failed to create product: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Error creating product');
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Product</h1>
        <p className="text-gray-600">Create a new dog food product</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
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
                placeholder="e.g., Premium Chicken & Rice"
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
                placeholder="premium-chicken-rice"
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
                placeholder="e.g., Adult, Puppy, Senior"
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
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Package */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-2xl">💰</span>
            Pricing & Package
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Package Size (g)
              </label>
              <input
                type="number"
                name="package_size_g"
                value={formData.package_size_g}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2000"
                step="1"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price (GBP)
              </label>
              <input
                type="number"
                name="price_gbp"
                value={formData.price_gbp}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 25.99"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price per kg (GBP)
              </label>
              <input
                type="number"
                name="price_per_kg_gbp"
                value={formData.price_per_kg_gbp}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 12.99"
                step="0.01"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Affiliate URL
              </label>
              <input
                type="url"
                name="affiliate_url"
                value={formData.affiliate_url}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://amazon.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Discount Code
              </label>
              <input
                type="text"
                name="discount_code"
                value={formData.discount_code}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., SAVE20"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Discount Description
            </label>
            <input
              type="text"
              name="discount_description"
              value={formData.discount_description}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Save 20% on first order"
            />
          </div>

          <div className="mt-6">
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

        {/* Nutritional Information */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-2xl">🥩</span>
            Nutritional Information
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Protein (%)
              </label>
              <input
                type="number"
                name="protein_percent"
                value={formData.protein_percent}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 26.5"
                step="0.1"
                min="0"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fat (%)
              </label>
              <input
                type="number"
                name="fat_percent"
                value={formData.fat_percent}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 15.0"
                step="0.1"
                min="0"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fiber (%)
              </label>
              <input
                type="number"
                name="fiber_percent"
                value={formData.fiber_percent}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 3.5"
                step="0.1"
                min="0"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Moisture (%)
              </label>
              <input
                type="number"
                name="moisture_percent"
                value={formData.moisture_percent}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 10.0"
                step="0.1"
                min="0"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ash (%)
              </label>
              <input
                type="number"
                name="ash_percent"
                value={formData.ash_percent}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 7.0"
                step="0.1"
                min="0"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Calories (per 100g)
              </label>
              <input
                type="number"
                name="calories_per_100g"
                value={formData.calories_per_100g}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 380"
                step="1"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Meat Content (%)
              </label>
              <input
                type="number"
                name="meat_content_percent"
                value={formData.meat_content_percent}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 65"
                step="0.1"
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-2xl">📝</span>
            Ingredients
          </h2>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ingredients List
            </label>
            <textarea
              name="ingredients_raw"
              value={formData.ingredients_raw}
              onChange={handleChange}
              rows={6}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Chicken (65%), Sweet Potato (20%), Peas (5%), ..."
            />
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-2xl">⚙️</span>
            Settings
          </h2>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Meta Description (for SEO)
            </label>
            <textarea
              name="meta_description"
              value={formData.meta_description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description for search engines..."
              maxLength={160}
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.meta_description.length}/160 characters
            </p>
          </div>

          <div className="flex gap-8">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="is_sponsored"
                checked={formData.is_sponsored}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-semibold text-gray-700">
                Sponsored Product
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="is_available"
                checked={formData.is_available}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-semibold text-gray-700">
                Available for Sale
              </span>
            </label>
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
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save size={20} />
                Create Product
              </>
            )}
          </button>
        </div>
      </form>
    </Container>
  );
}
