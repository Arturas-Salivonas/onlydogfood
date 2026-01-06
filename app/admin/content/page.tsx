import { getServiceSupabase } from '@/lib/supabase';
import { Container } from '@/components/layout/Container';
import Link from 'next/link';
import { FileText, Edit, Eye } from 'lucide-react';

async function getContentPages() {
  const supabase = getServiceSupabase();

  // For now, we'll return static content pages
  // In a real implementation, this would fetch from a content table
  return [
    {
      id: 'how-we-score',
      title: 'How We Score',
      slug: 'how-we-score',
      description: 'How we rate and score dog food products (v2.0)',
      lastUpdated: '2025-12-24',
      status: 'published'
    },
    {
      id: 'about',
      title: 'About Us',
      slug: 'about',
      description: 'About OnlyDogFood and our mission',
      lastUpdated: '2025-01-01',
      status: 'draft'
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      slug: 'privacy',
      description: 'Privacy policy and data handling',
      lastUpdated: '2025-01-01',
      status: 'published'
    },
    {
      id: 'terms',
      title: 'Terms of Service',
      slug: 'terms',
      description: 'Terms and conditions',
      lastUpdated: '2025-01-01',
      status: 'published'
    }
  ];
}

export default async function AdminContentPage() {
  const pages = await getContentPages();

  return (
    <Container>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Management</h1>
        <p className="text-gray-600">Manage static pages and content</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Content Pages</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {pages.map((page) => (
            <div key={page.id} className="px-6 py-4 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-900">{page.title}</h3>
                    <p className="text-sm text-gray-600">{page.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Last updated: {page.lastUpdated} • Status: {page.status}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/${page.slug}`}
                  className="inline-flex items-center gap-1 px-3 py-1 text-sm text-primary hover:text-primary-hover hover:bg-background rounded"
                >
                  <Eye className="w-4 h-4" />
                  View
                </Link>
                <Link
                  href={`/admin/content/${page.id}/edit`}
                  className="inline-flex items-center gap-1 px-3 py-1 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}



