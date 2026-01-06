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
        {/* Hero Section */}
        <section className="relative bg-[var(--color-trust-bg)]">
          <Container className="relative pt-24 md:pt-32 pb-6 md:pb-8">
            <div className="max-w-4xl mx-auto text-center">


              <h1 className="text-4xl md:text-6xl font-normal mb-2 leading-tight text-[var(--color-text-primary)]">
                Choosing a dog food for the <br />first time shouldn't feel stressful...
              </h1>

              <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto text-[var(--color-text-secondary)]">
              We help new dog owners find safe, suitable food - without marketing nonsense or confusing labels.
              </p>


              {/* <div className="max-w-md mx-auto mb-8">
                <LiveSearchBar
                  placeholder="Search dog food..."

                  className="w-full"
                />
              </div> */}


              {/* <StatsSection /> */}

              <div className="flex flex-col gap-2 justify-center items-center">
                <Link
                  href="/dog-food"
                  className="group inline-flex items-center gap-2 px-6 py-2 rounded-[30px] font-regular text-base hover:opacity-90 transition-all bg-[var(--color-trust)] text-[var(--color-background-card)] shadow-[var(--shadow-medium)]"
                >
                  Help me choose safely
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
                <p className="italic text-xsmall py-2 text-[var(--color-text-secondary)] opacity-75">
                  Free, no sign-up / no cc required, takes 30 seconds
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* How Only Dog Food Works Section */}
        <section className="py-20 bg-[var(--color-background-card)]">
          <Container>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-normal mb-4 text-[var(--color-text-primary)]">
                How Only dog food works
              </h2>
              <p className="text-lg max-w-2xl mx-auto text-[var(--color-text-secondary)]">
                Simple, transparent, and designed for new dog owners
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="rounded-lg border p-8 text-center bg-[var(--color-background-card)] border-[var(--color-border)] shadow-[var(--shadow-small)]">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-[var(--color-trust-bg)] text-[var(--color-trust)] text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-bold mb-4 text-[var(--color-text-primary)]">Answer a few questions</h3>
                <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
                  Your dog's age, size, sensitivities and preferences.
                </p>
              </div>

              <div className="rounded-lg border p-8 text-center bg-[var(--color-background-card)] border-[var(--color-border)] shadow-[var(--shadow-small)]">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-[var(--color-trust-bg)] text-[var(--color-trust)] text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-bold mb-4 text-[var(--color-text-primary)]">We analyse ingredient quality</h3>
                <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
                  We check meat content, fillers, additives and nutritional balance.
                </p>
              </div>

              <div className="rounded-lg border p-8 text-center bg-[var(--color-background-card)] border-[var(--color-border)] shadow-[var(--shadow-small)]">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-[var(--color-trust-bg)] text-[var(--color-trust)] text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-bold mb-4 text-[var(--color-text-primary)]">You get safe first choices</h3>
                <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
                  Clear recommendations with prices and explanations.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* How We Rate Dog Food Section */}
        <section className="py-20 bg-[var(--color-background-neutral)]">
          <Container>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-normal mb-4 text-[var(--color-text-primary)]">
                How we rate dog food
              </h2>
              <p className="text-lg max-w-2xl mx-auto text-[var(--color-text-secondary)]">
                Our transparent scoring system analyzes every aspect of dog food quality
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 rounded-lg flex items-center justify-center text-2xl font-normal mx-auto mb-6 bg-[var(--color-trust-bg)] text-[var(--color-text-primary)] shadow-[var(--shadow-small)]">
                  1
                </div>
                <h3 className="text-lg font-bold mb-3 text-[var(--color-text-primary)]">Ingredient analysis</h3>
                <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  We examine every ingredient for quality, sourcing, and nutritional value using scientific standards.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 rounded-lg flex items-center justify-center text-2xl font-normal mx-auto mb-6 bg-[var(--color-trust-bg)] text-[var(--color-text-primary)] shadow-[var(--shadow-small)]">
                  2
                </div>
                <h3 className="text-lg font-bold mb-3 text-[var(--color-text-primary)]">Nutritional balance</h3>
                <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  Complete nutritional profiles are evaluated against AAFCO standards for all life stages.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 rounded-lg flex items-center justify-center text-2xl font-normal mx-auto mb-6 bg-[var(--color-trust-bg)] text-[var(--color-text-primary)] shadow-[var(--shadow-small)]">
                  3
                </div>
                <h3 className="text-lg font-bold mb-3 text-[var(--color-text-primary)]">Value assessment</h3>
                <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  Price per kg is compared against quality scores to determine the best value for money.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 rounded-lg flex items-center justify-center text-2xl font-normal mx-auto mb-6 bg-[var(--color-trust-bg)] text-[var(--color-text-primary)] shadow-[var(--shadow-small)]">
                  4
                </div>
                <h3 className="text-lg font-bold mb-3 text-[var(--color-text-primary)]">Final score</h3>
                <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  All factors are weighted and combined into a transparent 100-point scoring system.
                </p>
              </div>
            </div>

            <div className="text-center mt-12">
              <Link
                href="/methodology"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-[30px] font-bold text-base hover:opacity-90 transition-all bg-[var(--color-trust)] text-[var(--color-background-card)] shadow-[var(--shadow-medium)]"
              >
                Learn more about our methodology
                <span>→</span>
              </Link>
            </div>
          </Container>
        </section>

        {/* Best Foods Section */}
        <BestFoodsSection />



        <section className="py-20 relative overflow-hidden bg-[var(--color-trust-bg)]">
          <Container className="relative">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-normal mb-6 text-[var(--color-text-primary)]">
                Ready to find better food?
              </h2>
              <p className="text-lg mb-8 text-[var(--color-text-secondary)]">
                Join thousands of dog owners making informed decisions about their pet's nutrition
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/dog-food"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-[30px] font-bold text-base hover:opacity-90 transition-all bg-[var(--color-trust)] text-[var(--color-background-card)] shadow-[var(--shadow-medium)]"
                >
                  Start browsing
                  <span>→</span>
                </Link>
                <Link
                  href="/compare"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-[30px] font-normal text-base transition-all border border-[var(--color-border)] bg-[var(--color-background-card)] text-[var(--color-text-primary)]"
                >
                  Compare products
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
