import { MetadataRoute } from 'next';
import { getSupabase } from '@/lib/supabase';
import { Product, Brand } from '@/types';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://onlydogfood.com';

  try {
    const supabase = getSupabase();

    // Get all products
    const { data: products } = await supabase
      .from('products')
      .select('slug, updated_at')
      .eq('is_available', true)
      .order('updated_at', { ascending: false });

    // Get all brands
    const { data: brands } = await supabase
      .from('brands')
      .select('slug, updated_at')
      .order('updated_at', { ascending: false });

    const productUrls = (products as Pick<Product, 'slug' | 'updated_at'>[] || []).map((product) => ({
      url: `${baseUrl}/dog-food/${product.slug}`,
      lastModified: new Date(product.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    const brandUrls = (brands as Pick<Brand, 'slug' | 'updated_at'>[] || []).map((brand) => ({
      url: `${baseUrl}/brands/${brand.slug}`,
      lastModified: new Date(brand.updated_at || new Date()),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/dog-food`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/brands`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/compare`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/how-we-rate-dog-food`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      ...productUrls,
      ...brandUrls,
    ];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return basic sitemap on error
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ];
  }
}