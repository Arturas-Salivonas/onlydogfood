import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageHero } from '@/components/layout/PageHero';
import { PageSEO } from '@/components/seo';

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <PageSEO
        title="Privacy Policy - OnlyDogFood"
        description="Learn how OnlyDogFood collects, uses, and protects your personal information."
        canonicalUrl="/privacy"
      />

      <PageHero
        title="Privacy Policy"
        description="How we collect, use, and protect your information"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Privacy Policy', href: '/privacy' },
        ]}
      />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="prose prose-lg max-w-none">
              <p className="text-sm text-gray-500 mb-8">Last updated: December 13, 2025</p>

              <h2>Information We Collect</h2>
              <p>
                OnlyDogFood collects minimal personal information necessary to provide our services.
                We may collect:
              </p>
              <ul>
                <li>Email addresses for account registration and communications</li>
                <li>Usage data and analytics to improve our service</li>
                <li>Cookies and similar technologies for functionality</li>
              </ul>

              <h2>How We Use Your Information</h2>
              <p>We use collected information to:</p>
              <ul>
                <li>Provide and maintain our dog food rating services</li>
                <li>Send important updates about our methodology or service changes</li>
                <li>Improve our website and user experience</li>
                <li>Ensure the security and integrity of our platform</li>
              </ul>

              <h2>Information Sharing</h2>
              <p>
                We do not sell, trade, or otherwise transfer your personal information to third parties
                without your consent, except as described in this policy or required by law.
              </p>

              <h2>Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal
                information against unauthorized access, alteration, disclosure, or destruction.
              </p>

              <h2>Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Access the personal information we hold about you</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Request deletion of your personal information</li>
                <li>Object to or restrict processing of your information</li>
              </ul>

              <h2>Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at
                privacy@onlydogfood.com.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}