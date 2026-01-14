'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full py-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg p-4 border bg-[var(--color-background-card)] border-[var(--color-border)] shadow-[var(--shadow-small)]">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">

              <span className="text-xl font-bold text-[var(--color-text-primary)]">
                  <img className="navigation-logo" src="/logo/odf-logo.png" alt="Only Dog Food " width={220}/>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/dog-food"
                className="px-4 py-2   text-[var(--color-text-primary)] hover:text-[var(--color-trust)] hover:bg-[var(--color-trust-bg)] rounded-lg transition-all"
              >
                Browse food
              </Link>
              <Link
                href="/brands"
                className="px-4 py-2   text-[var(--color-text-primary)] hover:text-[var(--color-trust)] hover:bg-[var(--color-trust-bg)] rounded-lg transition-all"
              >
                Brands
              </Link>
              <Link
                href="/compare"
                className="px-4 py-2 text-[var(--color-text-primary)] hover:text-[var(--color-trust)] hover:bg-[var(--color-trust-bg)] rounded-lg transition-all"
              >
                Compare
              </Link>
              <Link
                href="/how-we-rate-dog-food"
                className="px-4 py-2  text-[var(--color-text-primary)] hover:text-[var(--color-trust)] hover:bg-[var(--color-trust-bg)] rounded-lg transition-all"
              >
                How we rate
              </Link>
            </nav>

            {/* Right side buttons */}
            {/* <div className="hidden md:flex items-center gap-3">

              <Link
                href="/admin"
                className="px-5 py-2 text-sm font-bold bg-[var(--color-trust)] text-[var(--color-background-card)] rounded-lg hover:opacity-90 transition-all shadow-[var(--shadow-small)]"
              >
                Admin
              </Link>
            </div> */}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-[var(--color-text-primary)] hover:bg-[var(--color-trust-bg)] rounded-lg transition-all"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden pt-4 mt-4 border-t border-[var(--color-border)]">
              <nav className="flex flex-col gap-2">
                <Link
                  href="/dog-food"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 text-base font-bold text-[var(--color-text-primary)] hover:text-[var(--color-trust)] hover:bg-[var(--color-trust-bg)] rounded-lg transition-all"
                >
                  Browse food
                </Link>
                <Link
                  href="/brands"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 text-base font-bold text-[var(--color-text-primary)] hover:text-[var(--color-trust)] hover:bg-[var(--color-trust-bg)] rounded-lg transition-all"
                >
                  Brands
                </Link>
                <Link
                  href="/compare"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 text-base font-bold text-[var(--color-text-primary)] hover:text-[var(--color-trust)] hover:bg-[var(--color-trust-bg)] rounded-lg transition-all"
                >
                  Compare
                </Link>
                <Link
                  href="/how-we-rate-dog-food"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 text-base font-bold text-[var(--color-text-primary)] hover:text-[var(--color-trust)] hover:bg-[var(--color-trust-bg)] rounded-lg transition-all"
                >
                  How we rate
                </Link>
                <div className="border-t border-[var(--color-border)] my-2"></div>
                <Link
                  href="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 text-base font-bold text-[var(--color-text-primary)] hover:bg-[var(--color-trust-bg)] rounded-lg transition-all"
                >
                  Admin panel
                </Link>
                <Link
                  href="/dog-food"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 text-base font-bold bg-[var(--color-trust)] text-[var(--color-background-card)] rounded-lg hover:opacity-90 transition-all text-center shadow-[var(--shadow-small)]"
                >
                  Get started
                </Link>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
