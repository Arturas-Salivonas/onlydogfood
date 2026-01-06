import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageHero } from '@/components/layout/PageHero';
import { PageSEO } from '@/components/seo';

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <PageSEO
        title="Terms of Service - OnlyDogFood"
        description="Read OnlyDogFood's terms of service and usage guidelines."
        canonicalUrl="/terms"
      />

      <PageHero
        title="Terms of Service"
        description="Terms and conditions for using OnlyDogFood"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Terms of Service', href: '/terms' },
        ]}
      />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="prose prose-lg max-w-none">
              <p className="text-sm text-gray-500 mb-8">Last updated: December 13, 2025</p>

              <h2>Acceptance of Terms</h2>
              <p>
                By accessing and using OnlyDogFood, you accept and agree to be bound by the terms
                and provision of this agreement.
              </p>

              <h2>Use License</h2>
              <p>
                Permission is granted to temporarily access the materials (information or software)
                on OnlyDogFood's website for personal, non-commercial transitory viewing only.
              </p>

              <h2>Service Description</h2>
              <p>
                OnlyDogFood provides science-based ratings and reviews of dog food products.
                Our ratings are for informational purposes only and do not constitute veterinary advice.
              </p>

              <h2>User Responsibilities</h2>
              <p>Users agree to:</p>
              <ul>
                <li>Use the service for lawful purposes only</li>
                <li>Not attempt to gain unauthorized access to our systems</li>
                <li>Not use the service to distribute harmful content</li>
                <li>Respect intellectual property rights</li>
              </ul>

              <h2>Disclaimer</h2>
              <p>
                The information on OnlyDogFood is provided on an 'as is' basis. To the fullest extent
                permitted by law, OnlyDogFood excludes all representations, warranties, conditions
                and terms whether express or implied.
              </p>

              <h2>Limitation of Liability</h2>
              <p>
                In no event shall OnlyDogFood or its suppliers be liable for any damages (including,
                without limitation, damages for loss of data or profit, or due to business interruption)
                arising out of the use or inability to use the materials on OnlyDogFood's website.
              </p>

              <h2>Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at
                legal@onlydogfood.com.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}



