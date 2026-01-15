import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageHero } from '@/components/layout/PageHero';
import { PageSEO, FAQStructuredData, commonDogFoodFAQs, ArticleStructuredData } from '@/components/seo';
import { TrendingUp, Award, AlertTriangle } from 'lucide-react';
import { ProtectionIcon } from '@/components/ui/ProtectionIcon';

export default function HowWeScorePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background-neutral)]">
      <Header />

      <PageSEO
        title="How We Score Dog Food - Scoring Methodology v2.0"
        description="Learn about our science-based methodology v2.0 for rating dog food products with enhanced transparency, partial penalties, and improved nutritional ranges."
        canonicalUrl="/how-we-score"
      />

      <PageHero
        title="How we score dog food"
        description="Science-based scoring system v2.0 with enhanced transparency"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'How We Score', href: '/how-we-score' },
        ]}
      />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Algorithm Version Badge */}
          <div className="rounded-lg p-6 mb-8 bg-[var(--color-trust)] text-[var(--color-background-card)] shadow-[var(--shadow-medium)]">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8" />
                <div>
                  <p className="text-sm font-semibold opacity-90">Current version</p>
                  <p className="text-2xl font-black">Algorithm v2.0.0</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold opacity-90">Last updated</p>
                <p className="text-lg font-bold">December 24, 2025</p>
              </div>
            </div>
          </div>

          {/* Introduction */}
          <div className="rounded-lg border p-8 mb-8 bg-[var(--color-background-card)] border-[var(--color-border)] shadow-[var(--shadow-small)]">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-4 text-[var(--color-text-primary)]">Evidence-based dog food evaluation</h2>
              <p className="text-lg leading-relaxed mb-4 text-[var(--color-text-secondary)]">
                Our comprehensive scoring system evaluates dog food based on the latest scientific research,
                veterinary nutritional guidelines, and ingredient quality analysis. Version 2.0 introduces
                enhanced transparency features, partial penalty systems, and more nuanced nutritional ranges.
              </p>
              <div className="rounded-lg p-6 border bg-[var(--color-background-neutral)] border-[var(--color-border)]">
                <h3 className="font-bold mb-2 flex items-center gap-2 text-[var(--color-text-primary)]">
                  <TrendingUp className="w-5 h-5" />
                  What's new in v2.0
                </h3>
                <ul className="space-y-2 text-[var(--color-text-secondary)]">
                  <li className="flex items-start gap-2">
                    <ProtectionIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Meat content soft cap at 65% (prevents over-reliance on single protein sources)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ProtectionIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Partial filler penalties (-2 points each instead of all-or-nothing)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ProtectionIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Controversial additive detection (carrageenan, guar gum, etc.)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ProtectionIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Processing quality penalties (meal, digest, by-products)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ProtectionIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Adjusted protein ranges (22-32% optimal, pro-rated 18-22%)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ProtectionIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Fat penalty for obesity risk (&gt;20%)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ProtectionIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Vegetable carbohydrate bonus (+1 point)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ProtectionIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Fiber & micronutrient scoring (3 points total)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ProtectionIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Split value scoring: price per feed + ingredient-adjusted value</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Scoring Categories */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🌱</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Ingredient Quality</h3>
              <p className="text-gray-600 text-sm text-center mb-4">
                Named meat sources, processing quality, fillers, controversial additives
              </p>
              <div className="text-center">
                <div className="text-3xl font-black text-green-600">45 points</div>
                <p className="text-xs text-gray-500 mt-1">45% of total score</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="w-16 h-16 bg-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🥦</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Nutritional Value</h3>
              <p className="text-gray-600 text-sm text-center mb-4">
                Protein, fat, carbs, fiber, vitamins, and beneficial micronutrients
              </p>
              <div className="text-center">
                <div className="text-3xl font-black text-primary">33 points</div>
                <p className="text-xs text-gray-500 mt-1">33% of total score</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Value for Money</h3>
              <p className="text-gray-600 text-sm text-center mb-4">
                Price per feeding + ingredient-quality adjusted value
              </p>
              <div className="text-center">
                <div className="text-3xl font-black text-yellow-600">22 points</div>
                <p className="text-xs text-gray-500 mt-1">22% of total score</p>
              </div>
            </div>
          </div>

          {/* Detailed Scoring Breakdown */}
          <div className="space-y-8 mb-12">
            {/* Ingredient Quality */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-3xl">🌱</span>
                Ingredient Quality (45 points)
              </h3>
              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-gray-900">Meat Content</span>
                    <span className="font-bold text-green-600">up to 20 pts</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Graduated scoring: 30-40% (6 pts), 40-50% (12 pts), 50-65% (20 pts).
                    <strong> Soft cap at 65%</strong> to prevent over-reliance on single proteins.
                  </p>
                </div>

                <div className="border-l-4 border-red-500 pl-4 py-2">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-gray-900">Fillers</span>
                    <span className="font-bold text-red-600">-2 pts each</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Partial penalties for corn, wheat, soy, rice, and similar low-quality fillers.
                    More nuanced than binary scoring.
                  </p>
                </div>

                <div className="border-l-4 border-red-500 pl-4 py-2">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-gray-900">Artificial Additives</span>
                    <span className="font-bold text-red-600">-10 pts</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Penalty for artificial colors, flavors, or preservatives. <strong>Controversial additives</strong>
                    (carrageenan, guar gum, cellulose, propylene glycol, ethoxyquin) get -3 pts each.
                    Multiple preservatives: additional -10 pts.
                  </p>
                </div>

                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-gray-900">Named Meat Sources</span>
                    <span className="font-bold text-green-600">+5 pts</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Specific meat identification (chicken, beef, salmon) vs. vague terms (meat, poultry).
                  </p>
                </div>

                <div className="border-l-4 border-orange-500 pl-4 py-2">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-gray-900">Processing Quality</span>
                    <span className="font-bold text-orange-600">up to 5 pts</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    <strong>NEW:</strong> Penalties for heavily processed ingredients: meat meal, animal digest,
                    by-products, hydrolysates. -2 pts per processed ingredient (max -5).
                  </p>
                </div>
              </div>
            </div>

            {/* Nutritional Value */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-3xl">🥦</span>
                Nutritional Value (33 points)
              </h3>
              <div className="space-y-4">
                <div className="border-l-4 border-ring pl-4 py-2">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-gray-900">Protein</span>
                    <span className="font-bold text-primary">up to 15 pts</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    <strong>Updated ranges:</strong> 22-32% optimal (full 15 pts), 18-22% pro-rated,
                    &gt;35% plateau at 13.5 pts. &lt;18% sharp penalty (max 50% of points).
                  </p>
                </div>

                <div className="border-l-4 border-ring pl-4 py-2">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-gray-900">Fat</span>
                    <span className="font-bold text-primary">up to 8 pts</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Optimal 10-20%. <strong>NEW:</strong> Penalty for &gt;20% fat (obesity risk): -2 points.
                  </p>
                </div>

                <div className="border-l-4 border-ring pl-4 py-2">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-gray-900">Carbohydrates</span>
                    <span className="font-bold text-primary">up to 7 pts</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    &lt;30% gets full points, 30-40% partial. <strong>NEW:</strong> +1 bonus if carbs come from
                    vegetables (sweet potato, peas, carrots, etc.) vs. grains.
                  </p>
                </div>

                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-gray-900">Fiber & Micronutrients</span>
                    <span className="font-bold text-green-600">up to 3 pts</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    <strong>NEW:</strong> Appropriate fiber 2.5-5% (1 pt). Beneficial micronutrients like
                    omega-3, glucosamine, chondroitin, probiotics, antioxidants (2 pts max).
                  </p>
                </div>
              </div>
            </div>

            {/* Value for Money */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-3xl">💰</span>
                Value for Money (22 points)
              </h3>
              <div className="space-y-4">
                <div className="border-l-4 border-yellow-500 pl-4 py-2">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-gray-900">Price per Feed</span>
                    <span className="font-bold text-yellow-600">up to 15 pts</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Based on typical serving size vs. category average pricing. Best value gets full points.
                  </p>
                </div>

                <div className="border-l-4 border-yellow-500 pl-4 py-2">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-gray-900">Ingredient-Adjusted Value</span>
                    <span className="font-bold text-yellow-600">up to 7 pts</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    <strong>NEW:</strong> Quality-adjusted value scoring. Good price + high quality = 7 pts.
                    Cheap + low quality = 2 pts. Premium price + premium quality = 6 pts (justified).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Score Ranges */}
          <div className="bg-background rounded-2xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Score Interpretation</h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl font-black text-white">80+</span>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Excellent</h4>
                <p className="text-gray-600 text-sm">Premium dog food with outstanding nutrition and ingredients</p>
                <p className="text-xs text-gray-500 mt-2">Confidence: ±3 pts</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl font-black text-white">60-79</span>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Good</h4>
                <p className="text-gray-600 text-sm">Solid nutritional profile with quality ingredients</p>
                <p className="text-xs text-gray-500 mt-2">Confidence: ±5 pts</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl font-black text-white">40-59</span>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Fair</h4>
                <p className="text-gray-600 text-sm">Acceptable but with noticeable compromises</p>
                <p className="text-xs text-gray-500 mt-2">Confidence: ±5 pts</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl font-black text-white">&lt;40</span>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Poor</h4>
                <p className="text-gray-600 text-sm">Significant nutritional or ingredient concerns</p>
                <p className="text-xs text-gray-500 mt-2">Confidence: ±7 pts</p>
              </div>
            </div>
          </div>

          {/* Transparency & Confidence */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-primary" />
              Transparency & Confidence Bands
            </h3>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 mb-4">
                Version 2.0 introduces <strong>confidence bands</strong> to indicate the typical scoring range
                for each grade. Higher-quality foods have tighter confidence bands (±3 points) because their
                ingredient quality and nutritional profiles are more consistent.
              </p>
              <p className="text-gray-600 mb-4">
                Every product page now displays:
              </p>
              <ul className="text-gray-600 space-y-2 mb-4">
                <li><strong>Score breakdown by category</strong> - See exactly where points were earned or lost</li>
                <li><strong>Penalty explanations</strong> - Understand why points were deducted</li>
                <li><strong>Algorithm version</strong> - Know which scoring methodology was used</li>
                <li><strong>Confidence band</strong> - Typical score range for products of this quality level</li>
              </ul>
              <p className="text-gray-600">
                This transparency helps you make informed decisions and understand the "why" behind each score.
              </p>
            </div>
          </div>

          {/* Methodology Note */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment</h3>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 mb-4">
                Our scoring system is based on extensive research from veterinary nutritionists, peer-reviewed
                academic studies, AAFCO guidelines, and industry standards. We continuously update our methodology
                as new research becomes available.
              </p>
              <p className="text-gray-600 mb-4">
                All products are scored objectively using identical criteria. We do not accept payment for
                favorable reviews, and our ratings are based solely on nutritional quality and ingredient analysis.
              </p>
              <p className="text-gray-600">
                <strong>Important:</strong> While our scoring provides valuable evidence-based guidance,
                individual dogs may have specific nutritional needs based on age, breed, activity level, and
                health conditions. Always consult with your veterinarian before making significant changes
                to your dog's diet.
              </p>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">What changed in version 2.0?</h4>
                <p className="text-gray-600">
                  Version 2.0 introduces more nuanced scoring with partial penalties, updated nutritional ranges
                  based on latest research, processing quality evaluation, controversial additive detection,
                  and enhanced transparency features including confidence bands.
                </p>
              </div>
              <div className="border-b border-gray-100 pb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">How do you determine ingredient quality?</h4>
                <p className="text-gray-600">
                  We evaluate meat content with soft caps, identify specific vs. vague protein sources, assess
                  processing methods, detect controversial additives, and apply partial penalties for fillers.
                  This provides more accurate quality assessment than binary scoring.
                </p>
              </div>
              <div className="border-b border-gray-100 pb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Are your reviews unbiased?</h4>
                <p className="text-gray-600">
                  Yes, absolutely. All reviews are completely independent and based solely on nutritional analysis
                  and ingredient quality. We do not accept sponsorships or payments that could influence ratings.
                  Our algorithm is publicly documented and applied consistently to all products.
                </p>
              </div>
              <div className="border-b border-gray-100 pb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Why do some products have lower scores now?</h4>
                <p className="text-gray-600">
                  Version 2.0 is more stringent about processing quality, controversial additives, and nutritional
                  balance. Some products that scored well under the old system may score lower if they contain
                  heavily processed ingredients or excessive fat content.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Can I trust your scoring for my specific dog?</h4>
                <p className="text-gray-600">
                  Our scoring provides excellent general guidance based on canine nutritional science, but every
                  dog is unique. We strongly recommend consulting your veterinarian for personalized nutritional
                  advice, especially for puppies, seniors, or dogs with health conditions.
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
        headline="How We Score Dog Food - Scoring Methodology v2.0"
        description="Learn about our science-based methodology v2.0 for rating dog food products with enhanced transparency, partial penalties, and improved nutritional ranges."
        image="/og-methodology.jpg"
        datePublished="2024-01-01"
        dateModified="2025-12-24"
        author={{ name: "OnlyDogFood" }}
        publisher={{ name: "OnlyDogFood", logo: "/logo.png" }}
        url="/how-we-score"
      />
    </div>
  );
}
