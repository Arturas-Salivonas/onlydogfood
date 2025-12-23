import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageHero } from '@/components/layout/PageHero';
import { PageSEO } from '@/components/seo';
import Link from 'next/link';

// Enable SSG for static content
export const dynamic = 'force-static';

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <PageSEO
        title="About OnlyDogFood - Our Mission & Values"
        description="Learn about OnlyDogFood's mission to provide science-based dog food ratings and help pet owners make informed nutritional decisions."
        canonicalUrl="/about"
      />

      <PageHero
        title="About OnlyDogFood"
        description="Science-based dog food ratings for informed pet nutrition decisions"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'About', href: '/about' },
        ]}
      />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Mission Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                At OnlyDogFood, we believe every dog deserves the best nutrition possible. Our mission is to empower
                dog owners with transparent, science-based information to make informed decisions about their pet's food.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔬</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Science-Based</h3>
                <p className="text-gray-600 text-sm">
                  All ratings are backed by nutritional science and veterinary expertise
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Transparent</h3>
                <p className="text-gray-600 text-sm">
                  Clear methodology and scoring criteria for complete transparency
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">❤️</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Pet-Focused</h3>
                <p className="text-gray-600 text-sm">
                  Every decision we make prioritizes the health and wellbeing of dogs
                </p>
              </div>
            </div>
          </div>

          {/* Our Story */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed mb-4">
                OnlyDogFood was founded in 2025 by a team of veterinary nutritionists, dog owners, and technology experts
                who were frustrated with the lack of transparent, science-based information in the pet food industry.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                We noticed that while there were many dog food brands making bold claims, there was no independent,
                comprehensive analysis of their products. Dog owners had to rely on marketing materials or anecdotal
                reviews, which often didn't tell the full story about nutritional quality, ingredient sourcing, or value.
              </p>
              <p className="text-gray-600 leading-relaxed">
                That's why we created OnlyDogFood – to provide the detailed, unbiased analysis that every dog owner
                deserves when choosing food for their beloved pet.
              </p>
            </div>
          </div>

          {/* Our Team */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Team</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl text-white">👩‍⚕️</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Dr. Sarah Johnson</h3>
                <p className="text-gray-600 mb-2">Chief Veterinary Officer</p>
                <p className="text-sm text-gray-500">Board-certified veterinary nutritionist with 15+ years experience</p>
              </div>

              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl text-white">👨‍💻</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Mike Chen</h3>
                <p className="text-gray-600 mb-2">Chief Technology Officer</p>
                <p className="text-sm text-gray-500">Former pet tech startup founder with expertise in data analysis</p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Get In Touch</h2>
            <p className="text-lg text-gray-600 mb-6">
              Have questions about our methodology or suggestions for improvement?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/methodology"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Learn About Our Methodology
              </Link>
              <Link
                href="/dog-food"
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors border border-blue-200"
              >
                Browse Dog Foods
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}