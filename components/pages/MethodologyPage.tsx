import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageHero } from '@/components/layout/PageHero';
import { PageSEO, FAQStructuredData, commonDogFoodFAQs, ArticleStructuredData } from '@/components/seo';

export default function MethodologyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />

      <PageSEO
        title="Our Scoring Methodology - How We Rate Dog Food"
        description="Learn about our science-based methodology for rating dog food products across ingredient quality, nutritional value, and pricing."
        canonicalUrl="/methodology"
      />

      <PageHero
        title="Our Methodology"
        description="Science-based scoring system for dog food evaluation"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Methodology', href: '/methodology' },
        ]}
      />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Introduction */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How We Score Dog Food</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Our comprehensive scoring system evaluates dog food based on scientific research, nutritional analysis,
                and ingredient quality. We believe in evidence-based ratings that help you
                make informed decisions for your dog's health.
              </p>
            </div>
          </div>

          {/* Scoring Categories */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ingredients</h3>
              <p className="text-gray-600 text-sm">
                Quality of meat sources, fillers, artificial additives
              </p>
              <div className="mt-4 text-2xl font-bold text-green-600">45%</div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🥦</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Nutrition</h3>
              <p className="text-gray-600 text-sm">
                Protein, fat, carbs, vitamins, and mineral content analysis
              </p>
              <div className="mt-4 text-2xl font-bold text-blue-600">33%</div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Value</h3>
              <p className="text-gray-600 text-sm">
                Price per serving vs. nutritional quality
              </p>
              <div className="mt-4 text-2xl font-bold text-yellow-600">22%</div>
            </div>
          </div>

          {/* Detailed Scoring Breakdown */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Nutrition Scoring (33%)</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">High-quality protein sources</span>
                  <span className="font-semibold text-green-600">+15 points</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">Balanced fat content (15-25%)</span>
                  <span className="font-semibold text-green-600">+10 points</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">Low carbohydrate content</span>
                  <span className="font-semibold text-green-600">+10 points</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">Complete vitamin/mineral profile</span>
                  <span className="font-semibold text-green-600">+5 points</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Ingredients Scoring (45%)</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">Named meat sources</span>
                  <span className="font-semibold text-green-600">+12 points</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">No artificial additives</span>
                  <span className="font-semibold text-green-600">+10 points</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">No fillers (corn, wheat, soy)</span>
                  <span className="font-semibold text-green-600">+8 points</span>
                </div>
              </div>
            </div>
          </div>

          {/* Value Scoring */}
          <div className="mb-12">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Value Scoring (22%)</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">Excellent value (£0.50-£1 per day)</span>
                  <span className="font-semibold text-green-600">+20 points</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">Good value (£1-£1.50 per day)</span>
                  <span className="font-semibold text-yellow-600">+15 points</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">Fair value (£1.50-£2 per day)</span>
                  <span className="font-semibold text-orange-600">+10 points</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">Poor value (£2+ per day)</span>
                  <span className="font-semibold text-red-600">+5 points</span>
                </div>
              </div>
            </div>
          </div>

          {/* Score Ranges */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Score Ranges</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">90-100</span>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Excellent</h4>
                <p className="text-gray-600 text-sm">Top-tier dog food with outstanding nutrition and ingredients</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-yellow-600">70-89</span>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Good</h4>
                <p className="text-gray-600 text-sm">Solid nutritional profile with some room for improvement</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-red-600">0-69</span>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Poor</h4>
                <p className="text-gray-600 text-sm">Significant nutritional deficiencies or concerning ingredients</p>
              </div>
            </div>
          </div>

          {/* Methodology Note */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Methodology</h3>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 mb-4">
                Our scoring system is based on extensive research from veterinary nutritionists, academic studies,
                and industry standards. We continuously update our methodology as new research becomes available.
              </p>
              <p className="text-gray-600 mb-4">
                All products are scored objectively using the same criteria. We do not accept payment for favorable
                reviews, and our ratings are based solely on nutritional quality and ingredient analysis.
              </p>
              <p className="text-gray-600">
                <strong>Important:</strong> While our scoring provides valuable guidance, individual dogs may have
                specific nutritional needs. Always consult with your veterinarian before making significant changes
                to your dog's diet.
              </p>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">How do you score dog food products?</h4>
                <p className="text-gray-600">
                  We evaluate products across three main categories: Ingredients (45%), Nutrition (33%), and Value (22%).
                  Each category uses scientific criteria and veterinary research to determine the final score.
                </p>
              </div>
              <div className="border-b border-gray-100 pb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Are your reviews unbiased?</h4>
                <p className="text-gray-600">
                  Yes, all reviews are completely independent and based solely on nutritional analysis and ingredient quality.
                  We do not accept sponsorships or payments that could influence our ratings.
                </p>
              </div>
              <div className="border-b border-gray-100 pb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">How often do you update your reviews?</h4>
                <p className="text-gray-600">
                  We continuously monitor new research and update our methodology accordingly. Product reviews are refreshed
                  regularly, especially when new ingredient information becomes available.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Can I trust your scoring for my specific dog?</h4>
                <p className="text-gray-600">
                  Our scoring provides excellent general guidance, but every dog is unique. We recommend consulting your
                  veterinarian for personalized nutritional advice, especially for dogs with health conditions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* FAQ Structured Data */}
      <FAQStructuredData faqs={commonDogFoodFAQs} />

      {/* Article Structured Data */}
      <ArticleStructuredData
        headline="Our Scoring Methodology - How We Rate Dog Food"
        description="Learn about our science-based methodology for rating dog food products across ingredient quality, nutritional value, and pricing."
        image="/og-methodology.jpg"
        datePublished="2024-01-01"
        dateModified={new Date().toISOString().split('T')[0]}
        author={{ name: "OnlyDogFood" }}
        publisher={{ name: "OnlyDogFood", logo: "/logo.png" }}
        url="/methodology"
      />
    </div>
  );
}