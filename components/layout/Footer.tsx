import Link from 'next/link';
import { Container } from './Container';

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300 border-t border-gray-800">
      <Container className="py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <span className="text-3xl group-hover:scale-110 transition-transform">🐕</span>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 text-transparent bg-clip-text">
                OnlyDogFood
              </span>
            </Link>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Science-based dog food ratings and transparent reviews to help you make the best choice for your furry friend.
            </p>
            <div className="flex gap-3">
              <a href="https://twitter.com" target="_blank" rel="noopener" className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all">
                <span className="text-lg">𝕏</span>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener" className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all">
                <span className="text-lg">f</span>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener" className="w-10 h-10 bg-gray-800 hover:bg-pink-600 rounded-lg flex items-center justify-center transition-all">
                <span className="text-lg">📷</span>
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Products</h3>
            <ul className="space-y-3 text-sm font-mono">
              <li>
                <Link href="/dog-food" className="hover:text-blue-400 transition-colors">
                  Dog Food Directory
                </Link>
              </li>
              <li>
                <Link href="/brands" className="hover:text-blue-400 transition-colors">
                  All Brands
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-blue-400 transition-colors">
                  Compare Products
                </Link>
              </li>
              <li>
                <Link href="/dog-food?category=dry" className="hover:text-blue-400 transition-colors">
                  Dry Food
                </Link>
              </li>
              <li>
                <Link href="/dog-food?category=wet" className="hover:text-blue-400 transition-colors">
                  Wet Food
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Company</h3>
            <ul className="space-y-3 text-sm font-mono">
              <li>
                <Link href="/methodology" className="hover:text-blue-400 transition-colors">
                  Our Methodology
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-blue-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-400 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-blue-400 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-blue-400 transition-colors">
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Legal</h3>
            <ul className="space-y-3 text-sm font-mono">
              <li>
                <Link href="/privacy" className="hover:text-blue-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-blue-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-blue-400 transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-blue-400 transition-colors">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} OnlyDogFood.com. All rights reserved.
          </p>
          <p className="text-sm text-gray-500">
            Made with ❤️ for dogs everywhere
          </p>
        </div>
      </Container>
    </footer>
  );
}
