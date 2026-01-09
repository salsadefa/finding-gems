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
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    {/* Brand */}
                    <div className="footer-brand">
                        <Link href="/" className="footer-logo">
                            Dualangka
                        </Link>
                        <p className="footer-tagline">
                            Discover hidden gem websites built by independent creators and AI-enabled developers.
                        </p>
                    </div>

                    {/* Links */}
                    <div className="footer-links">
                        <div className="footer-column">
                            <h4 className="footer-heading">Product</h4>
                            <ul className="footer-list">
                                {footerLinks.product.map(link => (
                                    <li key={link.href}>
                                        <Link href={link.href} className="footer-link">{link.name}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="footer-column">
                            <h4 className="footer-heading">Company</h4>
                            <ul className="footer-list">
                                {footerLinks.company.map(link => (
                                    <li key={link.href}>
                                        <Link href={link.href} className="footer-link">{link.name}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="footer-column">
                            <h4 className="footer-heading">Legal</h4>
                            <ul className="footer-list">
                                {footerLinks.legal.map(link => (
                                    <li key={link.href}>
                                        <Link href={link.href} className="footer-link">{link.name}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="footer-bottom">
                    <p className="copyright">
                        © {new Date().getFullYear()} Dualangka. All rights reserved.
                    </p>
                    <p className="footer-note">
                        Platform fee: Rp1.000 per transaction • No listing fees
                    </p>
                </div>
            </div>

            <style jsx>{`
        .footer {
          background: var(--gray-50);
          border-top: 1px solid var(--gray-200);
          padding: var(--space-12) 0 var(--space-8);
          margin-top: auto;
        }
        
        .footer-grid {
          display: grid;
          gap: var(--space-8);
        }
        
        @media (min-width: 768px) {
          .footer-grid {
            grid-template-columns: 1.5fr 2fr;
            gap: var(--space-12);
          }
        }
        
        .footer-brand {
          max-width: 320px;
        }
        
        .footer-logo {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--foreground);
        }
        
        .footer-logo:hover {
          color: var(--foreground);
        }
        
        .footer-tagline {
          margin-top: var(--space-3);
          font-size: 0.875rem;
          color: var(--gray-600);
          line-height: 1.6;
        }
        
        .footer-links {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-6);
        }
        
        @media (min-width: 640px) {
          .footer-links {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        
        .footer-heading {
          font-size: 0.8125rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--foreground);
          margin-bottom: var(--space-4);
        }
        
        .footer-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        
        .footer-link {
          font-size: 0.875rem;
          color: var(--gray-600);
          transition: color var(--transition-fast);
        }
        
        .footer-link:hover {
          color: var(--foreground);
        }
        
        .footer-bottom {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          margin-top: var(--space-8);
          padding-top: var(--space-6);
          border-top: 1px solid var(--gray-200);
        }
        
        @media (min-width: 640px) {
          .footer-bottom {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }
        
        .copyright {
          font-size: 0.8125rem;
          color: var(--gray-500);
        }
        
        .footer-note {
          font-size: 0.75rem;
          color: var(--gray-400);
        }
      `}</style>
        </footer>
    );
}
