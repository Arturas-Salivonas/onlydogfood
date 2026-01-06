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
          <div className="bg-surface rounded-2xl shadow-sm border border-primary-light p-8 mb-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">Our Mission</h2>
              <p className="text-lg text-text-secondary leading-relaxed">
                At OnlyDogFood, we believe every dog deserves the best nutrition possible. Our mission is to empower
                dog owners with transparent, science-based information to make informed decisions about their pet's food.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-surface">🔬</span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Science-Based</h3>
                <p className="text-text-secondary text-sm">
                  All ratings are backed by nutritional science and veterinary expertise
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Transparent</h3>
                <p className="text-text-secondary text-sm">
                  Clear methodology and scoring criteria for complete transparency
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-secondary-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">❤️</span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Pet-Focused</h3>
                <p className="text-text-secondary text-sm">
                  Every decision we make prioritizes the health and wellbeing of dogs
                </p>
              </div>
            </div>
          </div>

          {/* Our Story */}
          <div className="bg-surface rounded-2xl shadow-sm border border-primary-light p-8 mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-text-secondary leading-relaxed mb-4">
                OnlyDogFood was founded in 2025 by a team of veterinary nutritionists, dog owners, and technology experts
                who were frustrated with the lack of transparent, science-based information in the pet food industry.
              </p>
              <p className="text-text-secondary leading-relaxed mb-4">
                We noticed that while there were many dog food brands making bold claims, there was no independent,
                comprehensive analysis of their products. Dog owners had to rely on marketing materials or anecdotal
                reviews, which often didn't tell the full story about nutritional quality, ingredient sourcing, or value.
              </p>
              <p className="text-text-secondary leading-relaxed">
                That's why we created OnlyDogFood – to provide the detailed, unbiased analysis that every dog owner
                deserves when choosing food for their beloved pet.
              </p>
            </div>
          </div>

          {/* Our Team */}
          <div className="bg-surface rounded-2xl shadow-sm border border-primary-light p-8 mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-6">Our Team</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center">
                <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl text-surface">👩‍⚕️</span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Dr. Sarah Johnson</h3>
                <p className="text-text-secondary mb-2">Chief Veterinary Officer</p>
                <p className="text-sm text-text-secondary">Board-certified veterinary nutritionist with 15+ years experience</p>
              </div>

              <div className="text-center">
                <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl text-surface">👨‍💻</span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Mike Chen</h3>
                <p className="text-text-secondary mb-2">Chief Technology Officer</p>
                <p className="text-sm text-text-secondary">Former pet tech startup founder with expertise in data analysis</p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-neutral rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Get In Touch</h2>
            <p className="text-lg text-text-secondary mb-6">
              Have questions about our methodology or suggestions for improvement?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/how-we-score"
                className="inline-flex items-center gap-2 bg-primary text-surface px-6 py-3 rounded-xl font-semibold hover:bg-primary-hover transition-colors"
              >
                Learn About Our Methodology
              </Link>
              <Link
                href="/dog-food"
                className="inline-flex items-center gap-2 bg-surface text-primary px-6 py-3 rounded-xl font-semibold hover:bg-neutral transition-colors border border-secondary"
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
