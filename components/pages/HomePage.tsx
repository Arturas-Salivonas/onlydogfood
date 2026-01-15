'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/layout/Container';
import { PageSEO } from '@/components/seo';
import { DogSearchBar, StatsSection, BestFoodsSection } from '@/components/ui';
import { Quiz } from '@/components/ui/Quiz';

export default function HomePage() {
  const [isQuizOpen, setIsQuizOpen] = useState(false);

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
        <section className="bg-helper relative bg-[var(--color-trust-bg)]">
          <Container className="relative pt-24 md:pt-32 pb-0 z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left Column - Text Content */}

              <div className="text-left relative z-20">

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-[var(--color-text-primary)]">
                  Choosing a dog food for the first time shouldn't feel stressful...
                </h1>

                <p className="text-lg md:text-xl mb-8 text-[var(--color-text-secondary)] leading-relaxed">
                  We help new dog owners find safe, suitable food without marketing nonsense or confusing labels.
                </p>

                <div className="flex flex-col gap-3 items-start relative z-30">
                  <button
                    onClick={() => {
                      console.log('Button clicked!');
                      setIsQuizOpen(true);
                    }}
                    className="arrow-button group inline-flex items-center gap-2 px-8 py-4 rounded-[30px] font-bold text-base hover:opacity-90 transition-all bg-[var(--color-trust)] text-[var(--color-background-card)] shadow-[var(--shadow-medium)] cursor-pointer"
                  >
                    Help me choose safely
                  </button>

                  <p className="text-xsmall text-[var(--color-text-secondary)] italic">
                    Free • no sign-up required • Takes 30 seconds
                  </p>
                </div>
              </div>

              {/* Right Column - Image */}
              <div className="relative hidden md:block z-10">
                <div className="relative  overflow-hidden ">
                  <img
                    src="/home/hero.png"
                    alt="Happy dog with quality food"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>

          </Container>
        </section>


     {/* Best Foods Section */}
        <BestFoodsSection />

        {/* Combined Story + How We Rate Section */}
        <section className="py-16 bg-[var(--color-background-neutral)]">
          <Container>
            {/* Section Title */}
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-normal mb-2 text-[var(--color-text-primary)]">
                We built this because we needed it
              </h2>
            </div>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
              {/* Left Column - Story */}
              <div className="bg-[var(--color-trust-bg)] border-2 border-[var(--color-trust)]/30 rounded-xl p-6 md:p-8">
                {/* Badge */}
             <h3 className="text-xl font-bold mb-4 text-[var(--color-text-primary)] text-center">First-time dog owners, just like you</h3>

                {/* Content with floating image */}
                <div className="relative">
                  <img
                    alt="Dog Owner"
                    src="/home/personal-image.webp"
                    className="float-left mr-4 mb-3 rounded-full object-cover shadow-lg"
                    style={{ width: '95px', height: '95px' }}
                  />

                  <div className="space-y-3 text-sm text-[var(--color-text-primary)] leading-relaxed">
                    <p>
                      When we got our first dog, we spent hours comparing food. Every bag claimed to be "premium" or "natural," but it was hard to know what that actually meant.
                    </p>
                    <p>
                      We're not veterinarians — we're engineers. So instead of guessing, we built a system that does the hard work for us.
                    </p>
                    <p className="font-semibold">
                      Our AI reads every ingredient label, checks each ingredient against nutritional data, and scores dog food based on what really matters for our dogs' health.
                    </p>
                    <p className="text-xs italic text-[var(--color-text-secondary)] pt-2 border-t border-[var(--color-trust)]/20 clear-left">
                      Every food is analyzed the same way we wish we'd had when we started.
                    </p>
                     <StatsSection />
                  </div>
                </div>
              </div>

              {/* Right Column - How AI Rates */}
              <div className="bg-[var(--color-background-card)] border-2 border-[var(--color-border)] rounded-xl p-6 md:p-8">
                <h3 className="text-xl font-bold mb-2 text-[var(--color-text-primary)] text-center">
                  How our system rates every product
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] text-center mb-6">
                  100 points split across three key areas
                </p>

                <div className="space-y-4">
                  {/* Ingredients */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-[var(--color-border)]">
                    <div className="flex-shrink-0 text-3xl">
                      <img className="float-left mr-4 mb-3 object-cover " src="/home/pet-food.png" alt="Ingredients Icon" width={50} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h6 className="font-bold text-sm text-[var(--color-text-primary)]">Ingredients</h6>
                        <span className="text-xs font-bold text-[var(--color-trust)]">Max 45 pts</span>
                      </div>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        Real meat, named sources, no fillers
                      </p>
                    </div>
                  </div>

                  {/* Nutrition */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-[var(--color-border)]">
                    <div className="flex-shrink-0 text-3xl">  <img className="float-left mr-4 mb-3 object-cover " src="/home/dog.png" alt="Ingredients Icon" width={50} /></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h6 className="font-bold text-sm text-[var(--color-text-primary)]">Nutrition</h6>
                        <span className="text-xs font-bold text-[var(--color-trust)]">Max 33 pts</span>
                      </div>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        Protein, fat, nutrients vs standards
                      </p>
                    </div>
                  </div>

                  {/* Value */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-[var(--color-border)]">
                  <div className="flex-shrink-0 text-3xl">  <img className="float-left mr-4 mb-3 object-cover " src="/home/money.png" alt="Ingredients Icon" width={50} /></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h6 className="font-bold text-sm text-[var(--color-text-primary)]">Value</h6>
                        <span className="text-xs font-bold text-[var(--color-trust)]">Max 22 pts</span>
                      </div>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        Fair pricing for quality
                      </p>
                    </div>
                  </div>
                </div>
                <h6 className="font-bold text-base mt-4 mb-4 text-[var(--color-text-primary)] text-center">What our system checks automatically:</h6>
              <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-4"><div className="flex gap-2 items-start"><div className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-trust)] flex items-center justify-center text-white text-xs font-bold mt-0.5">✓</div><div><p className="text-xs font-semibold text-[var(--color-text-primary)]">30+ ingredient categories</p></div></div><div className="flex gap-2 items-start"><div className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-trust)] flex items-center justify-center text-white text-xs font-bold mt-0.5">✓</div><div><p className="text-xs font-semibold text-[var(--color-text-primary)]">Named vs generic sources</p></div></div><div className="flex gap-2 items-start"><div className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-trust)] flex items-center justify-center text-white text-xs font-bold mt-0.5">✓</div><div><p className="text-xs font-semibold text-[var(--color-text-primary)]">Red flag ingredients</p></div></div><div className="flex gap-2 items-start"><div className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-trust)] flex items-center justify-center text-white text-xs font-bold mt-0.5">✓</div><div><p className="text-xs font-semibold text-[var(--color-text-primary)]">AAFCO standards</p></div></div></div>
              </div>
            </div>



            {/* Bottom CTA */}
            <div className="text-center">
              <Link
                href="/how-we-rate-dog-food"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-[30px] font-bold text-base hover:opacity-90 transition-all bg-[var(--color-trust)] text-[var(--color-background-card)] shadow-[var(--shadow-medium)]"
              >
                See the full breakdown

              </Link>

            </div>
          </Container>
        </section>





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

      {/* Quiz Modal */}
      <Quiz isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
    </div>
  );
}
