'use client';
import Link from 'next/link';

const footerLinks = {
  product: [
    { name: 'Explore', href: '/' },
    { name: 'Categories', href: '/search' },
    { name: 'For Creators', href: '/creator' },
    { name: 'Pricing', href: '/pricing' },
  ],
  company: [
    { name: 'About', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Careers', href: '/careers' },
    { name: 'Contact', href: '/contact' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      {/* Global Container with consistent padding */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16">

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand Section */}
          <div className="md:col-span-5 lg:col-span-4 max-w-sm">
            <Link href="/" className="text-2xl font-bold text-gray-900 block mb-4">
              Dualangka
            </Link>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              Discover hidden gem websites built by independent creators and AI-enabled developers.
            </p>
          </div>

          {/* Links Space */}
          <div className="md:col-span-7 lg:col-span-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              {/* Product */}
              <div>
                <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4">Product</h4>
                <ul className="space-y-3">
                  {footerLinks.product.map(link => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div>
                <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4">Company</h4>
                <ul className="space-y-3">
                  {footerLinks.company.map(link => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4">Legal</h4>
                <ul className="space-y-3">
                  {footerLinks.legal.map(link => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Dualangka. All rights reserved.
          </p>
          <p className="text-xs text-gray-400">
            Platform fee: Rp1.000 per transaction • No listing fees
          </p>
        </div>
      </div>
    </footer>
  );
}
