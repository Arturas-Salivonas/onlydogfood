import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageHero } from '@/components/layout/PageHero';
import { PageSEO } from '@/components/seo';
import { Container } from '@/components/layout/Container';

export default function HowWeRatePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background-neutral)]">
      <Header />

      <PageSEO
        title="How We Rate Dog Food - OnlyDogFood Scoring System"
        description="Simple, transparent dog food ratings based on ingredients, nutrition, and value. Learn how we analyze every product to help you choose better food for your dog."
        canonicalUrl="/how-we-rate-dog-food"
      />

      <PageHero
        title="How we rate dog food"
        description="Simple scoring that makes sense"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'How We Rate', href: '/how-we-rate-dog-food' },
        ]}
      />

      <main className="flex-1">
        <Container className="py-12">

          {/* Simple Introduction */}
          <div className="max-w-3xl mx-auto mb-16 text-center">
            <p className="text-xl leading-relaxed text-[var(--color-text-secondary)]">
              Every dog food on our site gets a score out of 100. Here's exactly what we look at and why it matters.
            </p>
          </div>

          {/* The 3 Main Categories */}
          <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto">
            {/* Ingredient Quality - 45% */}
            <div className="bg-[var(--color-background-card)] border-2 border-[var(--color-trust)] rounded-xl p-8 shadow-[var(--shadow-medium)]">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-trust)] text-white text-3xl mb-4">
                  🥩
                </div>
                <div className="text-4xl font-bold text-[var(--color-trust)] mb-2">45 points</div>
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Ingredient quality</h2>
              </div>
              <div className="space-y-4 text-sm text-[var(--color-text-secondary)]">
                <div className="flex gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <p><strong>Real meat content</strong> - Higher scores for more actual meat</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <p><strong>Named sources</strong> - "Chicken" beats "poultry"</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-red-600 font-bold">✗</span>
                  <p><strong>No junk fillers</strong> - Corn gluten, wheat gluten</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-red-600 font-bold">✗</span>
                  <p><strong>No artificial colors</strong> - Red 40, Yellow 5, etc.</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-red-600 font-bold">✗</span>
                  <p><strong>No harmful preservatives</strong> - BHA, BHT, ethoxyquin</p>
                </div>
              </div>
            </div>

            {/* Nutritional Balance - 33% */}
            <div className="bg-[var(--color-background-card)] border-2 border-[var(--color-border)] rounded-xl p-8 shadow-[var(--shadow-small)]">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-trust-bg)] text-[var(--color-trust)] text-3xl mb-4">
                  📊
                </div>
                <div className="text-4xl font-bold text-[var(--color-trust)] mb-2">33 points</div>
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Nutritional balance</h2>
              </div>
              <div className="space-y-4 text-sm text-[var(--color-text-secondary)]">
                <div className="flex gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <p><strong>Protein levels</strong> - Checked against AAFCO standards</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <p><strong>Fat content</strong> - Right amount for energy</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <p><strong>Fiber balance</strong> - Good for digestion</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <p><strong>Vitamins & minerals</strong> - Complete nutrition</p>
                </div>
              </div>
            </div>

            {/* Value for Money - 22% */}
            <div className="bg-[var(--color-background-card)] border-2 border-[var(--color-border)] rounded-xl p-8 shadow-[var(--shadow-small)]">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-trust-bg)] text-[var(--color-trust)] text-3xl mb-4">
                  💰
                </div>
                <div className="text-4xl font-bold text-[var(--color-trust)] mb-2">22 points</div>
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Value for money</h2>
              </div>
              <div className="space-y-4 text-sm text-[var(--color-text-secondary)]">
                <div className="flex gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <p><strong>Price per meal</strong> - Not just package price</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <p><strong>Quality comparison</strong> - Within similar categories</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <p><strong>Fair pricing</strong> - Good food doesn't have to be expensive</p>
                </div>
              </div>
            </div>
          </div>

          {/* What This Means for You */}
          <div className="bg-[var(--color-trust-bg)] border-2 border-[var(--color-trust)]/30 rounded-2xl p-8 md:p-12 max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-6 text-[var(--color-text-primary)] text-center">What this means for you</h2>
            <div className="space-y-6 text-base text-[var(--color-text-primary)] leading-relaxed">
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-trust)] text-white flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h3 className="font-bold mb-2">Higher scores = better food</h3>
                  <p className="text-[var(--color-text-secondary)]">
                    Scores above 80 are excellent. Between 60-79 is good. Below 60 means there are better options available.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-trust)] text-white flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h3 className="font-bold mb-2">We check every ingredient</h3>
                  <p className="text-[var(--color-text-secondary)]">
                    Our AI reads the label and flags anything concerning - artificial colors, mystery meat, cheap fillers. You see it all.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-trust)] text-white flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <h3 className="font-bold mb-2">No hidden bias</h3>
                  <p className="text-[var(--color-text-secondary)]">
                    We don't take money from brands. Every product gets the same analysis. Expensive doesn't always mean better.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-trust)] text-white flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <div>
                  <h3 className="font-bold mb-2">Clear red flags</h3>
                  <p className="text-[var(--color-text-secondary)]">
                    If we find really bad ingredients (like ethoxyquin or excessive artificial preservatives), the score drops significantly. Your dog's safety comes first.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Score Ranges Explained */}
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-8 text-[var(--color-text-primary)] text-center">Understanding the scores</h2>
            <div className="space-y-4">
              <div className="bg-[var(--color-background-card)] border-l-4 border-green-500 rounded-lg p-6 shadow-[var(--shadow-small)]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-[var(--color-text-primary)]">80-100 points</h3>
                  <div className="text-yellow-500">⭐⭐⭐⭐⭐</div>
                </div>
                <p className="text-[var(--color-text-secondary)]">
                  Excellent food. High meat content, clean ingredients, good nutrition, fair price. These are solid choices.
                </p>
              </div>

              <div className="bg-[var(--color-background-card)] border-l-4 border-blue-500 rounded-lg p-6 shadow-[var(--shadow-small)]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-[var(--color-text-primary)]">60-79 points</h3>
                  <div className="text-yellow-500">⭐⭐⭐⭐</div>
                </div>
                <p className="text-[var(--color-text-secondary)]">
                  Good food. Decent ingredients with maybe some fillers or less meat. Still a reasonable choice for most dogs.
                </p>
              </div>

              <div className="bg-[var(--color-background-card)] border-l-4 border-yellow-500 rounded-lg p-6 shadow-[var(--shadow-small)]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-[var(--color-text-primary)]">40-59 points</h3>
                  <div className="text-yellow-500">⭐⭐⭐</div>
                </div>
                <p className="text-[var(--color-text-secondary)]">
                  Fair food. Lots of fillers, less meat, or some questionable ingredients. You can probably find better options.
                </p>
              </div>

              <div className="bg-[var(--color-background-card)] border-l-4 border-red-500 rounded-lg p-6 shadow-[var(--shadow-small)]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-[var(--color-text-primary)]">Below 40 points</h3>
                  <div className="text-yellow-500">⭐⭐</div>
                </div>
                <p className="text-[var(--color-text-secondary)]">
                  Poor food. Significant issues with ingredients, nutrition, or contains harmful additives. We'd suggest looking for alternatives.
                </p>
              </div>
            </div>
          </div>

          {/* Real Example */}
          <div className="bg-[var(--color-background-card)] border border-[var(--color-border)] rounded-xl p-8 md:p-12 max-w-4xl mx-auto mb-16 shadow-[var(--shadow-medium)]">
            <h2 className="text-3xl font-bold mb-6 text-[var(--color-text-primary)] text-center">Real example</h2>
            <div className="space-y-4 text-base text-[var(--color-text-secondary)] leading-relaxed">
              <p className="font-semibold text-[var(--color-text-primary)]">
                Product: "Premium Chicken & Rice Dog Food"
              </p>
              <div className="space-y-3 pl-4 border-l-2 border-[var(--color-border)]">
                <p><strong className="text-[var(--color-text-primary)]">Ingredient score: 38/45</strong> - Good meat content (chicken meal, fresh chicken) but includes some corn. Named sources get points.</p>
                <p><strong className="text-[var(--color-text-primary)]">Nutrition score: 30/33</strong> - Protein and fat levels meet AAFCO standards. Balanced minerals.</p>
                <p><strong className="text-[var(--color-text-primary)]">Value score: 18/22</strong> - £2.80 per meal is fair for this quality level.</p>
              </div>
              <p className="text-xl font-bold text-[var(--color-trust)] pt-4">
                Total: 86/100 ⭐⭐⭐⭐⭐ (Excellent)
              </p>
            </div>
          </div>

          {/* Transparency Note */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 max-w-4xl mx-auto text-center">
            <h3 className="text-xl font-bold mb-4 text-[var(--color-text-primary)]">Complete transparency</h3>
            <p className="text-base text-[var(--color-text-secondary)] leading-relaxed">
              Our algorithm is constantly being refined based on new research and vet guidance.
              We show our work on every product page - you can see exactly why each food got its score.
              Questions about our scoring? <a href="/contact" className="text-[var(--color-trust)] font-semibold hover:underline">Get in touch</a>.
            </p>
          </div>

        </Container>
      </main>

      <Footer />
    </div>
  );
}
