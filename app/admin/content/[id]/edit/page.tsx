import { Container } from '@/components/layout/Container';
import Link from 'next/link';
import { ArrowLeft, Save, Eye } from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminContentEditPage({ params }: Props) {
  const { id } = await params;

  // Mock content data - in real implementation, fetch from database
  const contentData = {
    'how-we-score': {
      title: 'How We Score Dog Food',
      content: `# How We Score Dog Food

## Our Scoring Methodology v2.0

At OnlyDogFood, we use a comprehensive 100-point scoring system to evaluate dog food products...

## Ingredient Quality (45 points)

We analyze every ingredient for quality, sourcing, processing, and nutritional value...

## Nutritional Balance (33 points)

Complete nutritional profiles are evaluated against AAFCO standards and latest research...

## Value for Money (22 points)

Price per feeding is compared against quality scores with ingredient-adjusted value...`
    },
    about: {
      title: 'About OnlyDogFood',
      content: `# About OnlyDogFood

## Our Mission

To help dog owners make informed decisions about their pet's nutrition...`
    }
  };

  const pageData = contentData[id as keyof typeof contentData] || {
    title: 'Page Not Found',
    content: 'Content not found'
  };

  return (
    <Container>
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/admin/content"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Content
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Content: {pageData.title}</h1>
        <p className="text-gray-600">Edit the content for this page</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Content Editor</h2>
          <div className="flex items-center gap-2">
            <Link
              href={`/${id}`}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
            >
              <Eye className="w-4 h-4" />
              Preview
            </Link>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page Title
            </label>
            <input
              type="text"
              defaultValue={pageData.title}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content (Markdown)
            </label>
            <textarea
              rows={20}
              defaultValue={pageData.content}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter content in Markdown format..."
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Last saved: Never • Status: Draft
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg">
                Save Draft
              </button>
              <button className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700">
                Publish
              </button>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}