import Link from 'next/link';
import { Container } from './Container';

export function Footer() {
  return (
    <footer className="bg-[var(--color-background-neutral)] border-t border-[var(--color-border)]">
      <Container className="py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <span className="text-3xl group-hover:scale-110 transition-transform">🐕</span>
              <span className="text-xl font-bold text-[var(--color-text-primary)]">
                OnlyDogFood
              </span>
            </Link>
            <p className="text-sm text-[var(--color-text-secondary)] mb-6 leading-relaxed">
              Science-based dog food ratings and transparent reviews to help you make the best choice for your furry friend.
            </p>
            <div className="flex gap-3">
              <a href="https://twitter.com" target="_blank" rel="noopener" className="w-10 h-10 bg-[var(--color-background-card)] hover:bg-[var(--color-trust)] border border-[var(--color-border)] hover:border-[var(--color-trust)] text-[var(--color-text-primary)] hover:text-white rounded-lg flex items-center justify-center transition-all shadow-[var(--shadow-small)]">
                <span className="text-lg">𝕏</span>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener" className="w-10 h-10 bg-[var(--color-background-card)] hover:bg-[var(--color-trust)] border border-[var(--color-border)] hover:border-[var(--color-trust)] text-[var(--color-text-primary)] hover:text-white rounded-lg flex items-center justify-center transition-all shadow-[var(--shadow-small)]">
                <span className="text-lg">f</span>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener" className="w-10 h-10 bg-[var(--color-background-card)] hover:bg-[var(--color-trust)] border border-[var(--color-border)] hover:border-[var(--color-trust)] text-[var(--color-text-primary)] hover:text-white rounded-lg flex items-center justify-center transition-all shadow-[var(--shadow-small)]">
                <span className="text-lg">📷</span>
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-[var(--color-text-primary)] font-bold mb-4 text-sm">Products</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/dog-food" className="text-[var(--color-text-secondary)] hover:text-[var(--color-trust)] transition-colors">
                  Dog food
                </Link>
              </li>
              <li>
                <Link href="/brands" className="text-[var(--color-text-secondary)] hover:text-[var(--color-trust)] transition-colors">
                  All brands
                </Link>
              </li>
              <li>
                <Link href="/compare" className="text-[var(--color-text-secondary)] hover:text-[var(--color-trust)] transition-colors">
                  Compare products
                </Link>
              </li>
              <li>
                <Link href="/dog-food?category=dry" className="text-[var(--color-text-secondary)] hover:text-[var(--color-trust)] transition-colors">
                  Dry food
                </Link>
              </li>
              <li>
                <Link href="/dog-food?category=wet" className="text-[var(--color-text-secondary)] hover:text-[var(--color-trust)] transition-colors">
                  Wet food
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-[var(--color-text-primary)] font-bold mb-4 text-sm">Company</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/how-we-score" className="text-[var(--color-text-secondary)] hover:text-[var(--color-trust)] transition-colors">
                  Our methodology
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-[var(--color-text-secondary)] hover:text-[var(--color-trust)] transition-colors">
                  About us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[var(--color-text-secondary)] hover:text-[var(--color-trust)] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-[var(--color-text-secondary)] hover:text-[var(--color-trust)] transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-[var(--color-text-secondary)] hover:text-[var(--color-trust)] transition-colors">
                  Admin login
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-[var(--color-text-primary)] font-bold mb-4 text-sm">Legal</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/privacy" className="text-[var(--color-text-secondary)] hover:text-[var(--color-trust)] transition-colors">
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-[var(--color-text-secondary)] hover:text-[var(--color-trust)] transition-colors">
                  Terms of service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-[var(--color-text-secondary)] hover:text-[var(--color-trust)] transition-colors">
                  Cookie policy
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="text-[var(--color-text-secondary)] hover:text-[var(--color-trust)] transition-colors">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[var(--color-border)] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            © {new Date().getFullYear()} OnlyDogFood.com. All rights reserved.
          </p>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Made with ❤️ for dogs everywhere
          </p>
        </div>
      </Container>
    </footer>
  );
}
