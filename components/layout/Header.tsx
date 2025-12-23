'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full py-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-3xl group-hover:scale-110 transition-transform">🐕</span>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                OnlyDogFood
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 font-mono">
              <Link
                href="/dog-food"
                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
              >
                Browse Food
              </Link>
              <Link
                href="/brands"
                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
              >
                Brands
              </Link>
              <Link
                href="/compare"
                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
              >
                Compare
              </Link>
              <Link
                href="/methodology"
                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
              >
                How We Score
              </Link>
            </nav>

            {/* Right side buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/admin"
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
              >
                Admin
              </Link>
              <Link
                href="/dog-food"
                className="px-5 py-2 text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-xl hover:scale-105"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden pt-4 mt-4 border-t border-gray-200">
              <nav className="flex flex-col gap-2 font-mono">
                <Link
                  href="/dog-food"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 text-base font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                >
                  Browse Food
                </Link>
                <Link
                  href="/brands"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 text-base font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                >
                  Brands
                </Link>
                <Link
                  href="/compare"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 text-base font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                >
                  Compare
                </Link>
                <Link
                  href="/methodology"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 text-base font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                >
                  How We Score
                </Link>
                <div className="border-t border-gray-200 my-2"></div>
                <Link
                  href="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 text-base font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                >
                  Admin Panel
                </Link>
                <Link
                  href="/dog-food"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all text-center shadow-md"
                >
                  Get Started
                </Link>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
