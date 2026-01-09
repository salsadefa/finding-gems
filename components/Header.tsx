'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/store';
import { useState } from 'react';

const categories = [
    { name: 'Productivity', slug: 'productivity' },
    { name: 'Administration', slug: 'administration' },
    { name: 'Education', slug: 'education' },
    { name: 'AI Tools', slug: 'ai-tools' },
    { name: 'Finance', slug: 'finance' },
];

export default function Header() {
    const { user, isAuthenticated, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    return (
        <header className="header">
            <div className="container header-inner">
                {/* Logo */}
                <Link href="/" className="logo">
                    <span className="logo-text">Dualangka</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="nav-desktop">
                    <Link href="/" className="nav-link">Explore</Link>
                    {categories.slice(0, 4).map(cat => (
                        <Link key={cat.slug} href={`/category/${cat.slug}`} className="nav-link">
                            {cat.name}
                        </Link>
                    ))}
                </nav>

                {/* Search (Desktop) */}
                <div className="search-wrapper">
                    <Link href="/search" className="search-trigger">
                        <SearchIcon />
                        <span>Search websites...</span>
                    </Link>
                </div>

                {/* Auth / User Menu */}
                <div className="header-actions">
                    {isAuthenticated && user ? (
                        <div className="user-menu-wrapper">
                            <button
                                className="user-menu-trigger"
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                            >
                                <div className="avatar avatar-sm">
                                    {user.name.charAt(0)}
                                </div>
                                <span className="user-name">{user.name}</span>
                                <ChevronIcon />
                            </button>

                            {userMenuOpen && (
                                <div className="user-dropdown">
                                    <div className="dropdown-header">
                                        <span className="dropdown-name">{user.name}</span>
                                        <span className="dropdown-role">{user.role}</span>
                                    </div>
                                    <div className="dropdown-divider" />

                                    {user.role === 'buyer' && (
                                        <>
                                            <Link href="/dashboard" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                                                My Dashboard
                                            </Link>
                                            <Link href="/dashboard/messages" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                                                Messages
                                            </Link>
                                        </>
                                    )}

                                    {user.role === 'creator' && (
                                        <>
                                            <Link href="/creator" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                                                Creator Dashboard
                                            </Link>
                                            <Link href="/creator/listings" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                                                My Listings
                                            </Link>
                                            <Link href="/creator/messages" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                                                Messages
                                            </Link>
                                        </>
                                    )}

                                    {user.role === 'admin' && (
                                        <>
                                            <Link href="/admin" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                                                Admin Dashboard
                                            </Link>
                                            <Link href="/admin/creators" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                                                Manage Creators
                                            </Link>
                                        </>
                                    )}

                                    <div className="dropdown-divider" />
                                    <button className="dropdown-item" onClick={() => { logout(); setUserMenuOpen(false); }}>
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <Link href="/login" className="btn btn-ghost">Log In</Link>
                            <Link href="/signup" className="btn btn-primary">Sign Up</Link>
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        className="mobile-menu-toggle"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="mobile-menu">
                    <Link href="/search" className="mobile-search">
                        <SearchIcon />
                        <span>Search websites...</span>
                    </Link>
                    <nav className="mobile-nav">
                        <Link href="/" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                            Explore All
                        </Link>
                        {categories.map(cat => (
                            <Link
                                key={cat.slug}
                                href={`/category/${cat.slug}`}
                                className="mobile-nav-link"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </nav>
                    {!isAuthenticated && (
                        <div className="mobile-auth">
                            <Link href="/login" className="btn btn-secondary" style={{ width: '100%' }}>
                                Log In
                            </Link>
                            <Link href="/signup" className="btn btn-primary" style={{ width: '100%' }}>
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            )}

            <style jsx>{`
        .header {
          position: sticky;
          top: 0;
          z-index: 40;
          background: var(--background);
          border-bottom: 1px solid var(--gray-200);
        }
        
        .header-inner {
          display: flex;
          align-items: center;
          gap: var(--space-6);
          height: 64px;
        }
        
        .logo {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-weight: 700;
          font-size: 1.25rem;
          color: var(--foreground);
        }
        
        .logo:hover {
          color: var(--foreground);
        }
        
        .nav-desktop {
          display: none;
          gap: var(--space-1);
        }
        
        @media (min-width: 1024px) {
          .nav-desktop {
            display: flex;
          }
        }
        
        .nav-link {
          padding: var(--space-2) var(--space-3);
          font-size: 0.875rem;
          color: var(--gray-600);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }
        
        .nav-link:hover {
          color: var(--foreground);
          background: var(--gray-100);
        }
        
        .search-wrapper {
          flex: 1;
          max-width: 320px;
          display: none;
        }
        
        @media (min-width: 768px) {
          .search-wrapper {
            display: block;
          }
        }
        
        .search-trigger {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          width: 100%;
          padding: var(--space-2) var(--space-3);
          background: var(--gray-100);
          border-radius: var(--radius-md);
          color: var(--gray-500);
          font-size: 0.875rem;
          transition: all var(--transition-fast);
        }
        
        .search-trigger:hover {
          background: var(--gray-200);
          color: var(--gray-600);
        }
        
        .header-actions {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-left: auto;
        }
        
        .auth-buttons {
          display: none;
          gap: var(--space-2);
        }
        
        @media (min-width: 768px) {
          .auth-buttons {
            display: flex;
          }
        }
        
        .user-menu-wrapper {
          position: relative;
        }
        
        .user-menu-trigger {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-1) var(--space-2);
          background: none;
          border: 1px solid var(--gray-200);
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        
        .user-menu-trigger:hover {
          border-color: var(--gray-300);
          background: var(--gray-50);
        }
        
        .user-name {
          display: none;
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        @media (min-width: 768px) {
          .user-name {
            display: block;
          }
        }
        
        .user-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: var(--space-2);
          min-width: 200px;
          background: var(--background);
          border: 1px solid var(--gray-200);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          overflow: hidden;
          animation: fade-in 0.15s ease;
        }
        
        .dropdown-header {
          padding: var(--space-3) var(--space-4);
          border-bottom: 1px solid var(--gray-100);
        }
        
        .dropdown-name {
          display: block;
          font-weight: 600;
          font-size: 0.875rem;
        }
        
        .dropdown-role {
          display: block;
          font-size: 0.75rem;
          color: var(--gray-500);
          text-transform: capitalize;
        }
        
        .dropdown-divider {
          height: 1px;
          background: var(--gray-100);
        }
        
        .dropdown-item {
          display: block;
          width: 100%;
          padding: var(--space-3) var(--space-4);
          font-size: 0.875rem;
          color: var(--foreground);
          text-align: left;
          background: none;
          border: none;
          cursor: pointer;
          transition: background var(--transition-fast);
        }
        
        .dropdown-item:hover {
          background: var(--gray-50);
          color: var(--foreground);
        }
        
        .mobile-menu-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--foreground);
        }
        
        @media (min-width: 768px) {
          .mobile-menu-toggle {
            display: none;
          }
        }
        
        .mobile-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--background);
          border-bottom: 1px solid var(--gray-200);
          padding: var(--space-4);
          animation: slide-down 0.2s ease;
        }
        
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .mobile-search {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          width: 100%;
          padding: var(--space-3);
          background: var(--gray-100);
          border-radius: var(--radius-md);
          color: var(--gray-500);
          font-size: 0.875rem;
          margin-bottom: var(--space-4);
        }
        
        .mobile-nav {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }
        
        .mobile-nav-link {
          padding: var(--space-3);
          font-size: 0.9375rem;
          color: var(--foreground);
          border-radius: var(--radius-md);
          transition: background var(--transition-fast);
        }
        
        .mobile-nav-link:hover {
          background: var(--gray-100);
          color: var(--foreground);
        }
        
        .mobile-auth {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          margin-top: var(--space-4);
          padding-top: var(--space-4);
          border-top: 1px solid var(--gray-200);
        }
      `}</style>
        </header>
    );
}

// Icons
function SearchIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
        </svg>
    );
}

function MenuIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}

function ChevronIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
        </svg>
    );
}
