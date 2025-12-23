import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/layout/Container';
import { PageSEO } from '@/components/seo';
import { LiveSearchBar, StatsSection, BestFoodsSection } from '@/components/ui';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <PageSEO
        title="OnlyDogFood - Science-Based Dog Food Reviews & Ratings"
        description="Find the perfect dog food with science-based ratings, transparent scoring, and honest reviews. Compare nutritional analysis, ingredients, and prices for the healthiest food for your dog."
        canonicalUrl="/"
      />

      <main className="flex-1">
        {/* Hero Section - Modern Gradient */}
        <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white ">
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20" />

          <Container className="relative pt-24 md:pt-32 pb-12 md:pb-16">
            <div className="max-w-4xl mx-auto text-center">


              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Find the best
                <span className="block bg-gradient-to-r from-yellow-200 to-orange-300 text-transparent bg-clip-text ">
                  dog food
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed max-w-3xl mx-auto">
                Science-based ratings, transparent scoring, and honest reviews to help you choose the healthiest food for your furry friend.
              </p>

              {/* Live Search Bar */}
              <div className="max-w-md mx-auto mb-8">
                <LiveSearchBar
                  placeholder="Search dog food..."
                  variant="dark"
                  className="w-full"
                />
              </div>

              {/* Stats Section */}
              <StatsSection />

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/dog-food"
                  className="group inline-flex items-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
                >
                  Browse All Dog Foods
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
                <Link
                  href="/methodology"
                  className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all border border-white/20"
                >
                  How we score
                </Link>
              </div>
            </div>
          </Container>


        </section>




        {/* Best Foods Section */}
        <BestFoodsSection />

                {/* How It Works Section */}
        <section className="py-20 bg-white">
          <Container>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                How We Rate Dog Food
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Our transparent scoring system analyzes every aspect of dog food quality
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Ingredient Analysis</h3>
                <p className="text-gray-600 leading-relaxed">
                  We examine every ingredient for quality, sourcing, and nutritional value using scientific standards.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Nutritional Balance</h3>
                <p className="text-gray-600 leading-relaxed">
                  Complete nutritional profiles are evaluated against AAFCO standards for all life stages.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                  3
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Value Assessment</h3>
                <p className="text-gray-600 leading-relaxed">
                  Price per kg is compared against quality scores to determine the best value for money.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                  4
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Final Score</h3>
                <p className="text-gray-600 leading-relaxed">
                  All factors are weighted and combined into a transparent 100-point scoring system.
                </p>
              </div>
            </div>

            <div className="text-center mt-12">
              <Link
                href="/methodology"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all hover:scale-105"
              >
                Learn More About Our Methodology
                <span>→</span>
              </Link>
            </div>
          </Container>
        </section>

        {/* Brand Logos Section */}
        <section className="py-16 bg-white border-t border-gray-200">
          <Container>
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Trusted Brands We Analyze</h3>
              <p className="text-gray-600">We evaluate products from leading dog food manufacturers worldwide</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center opacity-60">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-400">ROYAL CANIN</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-400">HILL'S</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-400">PURINA</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-400">PEDIGREE</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-400">IAMS</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-400">EUKA NUB</div>
              </div>
            </div>
          </Container>
        </section>

        {/* CTA Section - Dark Modern */}
        <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
          <Container className="relative">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Find Better Food?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Join thousands of dog owners making informed decisions about their pet's nutrition
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/dog-food"
                  className="inline-flex items-center justify-center gap-2 bg-white text-blue-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
                >
                  Start Browsing
                  <span>→</span>
                </Link>
                <Link
                  href="/compare"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all border border-white/20"
                >
                  Compare Products
                </Link>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  );
}