import { getServiceSupabase } from '@/lib/supabase';
import { Container } from '@/components/layout/Container';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

async function getBrand(id: string) {
  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export default async function AdminBrandEditPage({ params }: Props) {
  const { id } = await params;
  const brand = await getBrand(id);

  if (!brand) {
    return (
      <Container>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Brand Not Found</h1>
          <Link
            href="/admin/brands"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Brands
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/admin/brands"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Brands
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Brand: {brand.name}</h1>
        <p className="text-gray-600">Update brand information</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Brand Details</h2>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>

        <form className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Name *
              </label>
              <input
                type="text"
                defaultValue={brand.name}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug *
              </label>
              <input
                type="text"
                defaultValue={brand.slug}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <input
                type="url"
                defaultValue={brand.website_url || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country of Origin
              </label>
              <input
                type="text"
                defaultValue={brand.country_of_origin || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo URL
            </label>
            <input
              type="url"
              defaultValue={brand.logo_url || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              rows={4}
              defaultValue={brand.description || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief description of the brand..."
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_featured"
                defaultChecked={brand.is_featured}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-900">
                Featured Brand
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_sponsored"
                defaultChecked={brand.is_sponsored}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_sponsored" className="ml-2 block text-sm text-gray-900">
                Sponsored Brand
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <Link
                href="/admin/brands"
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                Update Brand
              </button>
            </div>
          </div>
        </form>
      </div>
    </Container>
  );
}