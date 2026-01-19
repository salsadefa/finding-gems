'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/store';
import { useState, useEffect } from 'react';
import { Search, Menu, X, ChevronDown, LogOut, LayoutDashboard, MessageSquare, ShoppingBag } from 'lucide-react';

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
  const [scrolled, setScrolled] = useState(false);

  // Add shadow on scroll for better visibility
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Floating Capsule Container */}
      <header className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 w-[95%] max-w-5xl`}>
        <div className={`
          flex items-center justify-between 
          bg-white/90 backdrop-blur-md 
          rounded-full px-6 py-3 
          shadow-sm border border-gray-100/50
          transition-all duration-300
          ${scrolled ? 'shadow-md' : ''}
        `}>

          {/* LEFT: Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-bold text-xl tracking-tight text-gray-900 group-hover:text-black transition-colors">
              Dualangka
            </span>
          </Link>

          {/* CENTER: Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
              Explore
            </Link>
            {categories.slice(0, 4).map(cat => (
              <Link
                key={cat.slug}
                href={`/search?category=${cat.slug}`}
                className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-4">
            {/* Search Icon */}
            <Link
              href="/search"
              className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-all"
              aria-label="Search"
            >
              <Search size={20} strokeWidth={2} />
            </Link>

            {/* Auth Buttons */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center text-sm font-semibold shadow-sm">
                    {user.name.charAt(0)}
                  </div>
                  <ChevronDown size={14} className={`text-gray-500 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-4 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                      <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>

                    <div className="py-1">
                      {user.role === 'buyer' && (
                        <>
                          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black" onClick={() => setUserMenuOpen(false)}>
                            <LayoutDashboard size={16} /> Dashboard
                          </Link>
                          <Link href="/dashboard/messages" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black" onClick={() => setUserMenuOpen(false)}>
                            <MessageSquare size={16} /> Messages
                          </Link>
                        </>
                      )}

                      {user.role === 'creator' && (
                        <>
                          <Link href="/creator" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black" onClick={() => setUserMenuOpen(false)}>
                            <LayoutDashboard size={16} /> Creator Studio
                          </Link>
                          <Link href="/creator/listings" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black" onClick={() => setUserMenuOpen(false)}>
                            <ShoppingBag size={16} /> My Listings
                          </Link>
                        </>
                      )}

                      {user.role === 'admin' && (
                        <Link href="/admin" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black" onClick={() => setUserMenuOpen(false)}>
                          <LayoutDashboard size={16} /> Admin Panel
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-gray-50 mt-1 pt-1">
                      <button
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left transition-colors"
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="hidden sm:block text-sm font-medium text-gray-600 hover:text-black transition-colors">
                  Log In
                </Link>
                <Link href="/signup" className="px-5 py-2 text-sm font-medium text-white bg-black rounded-full hover:bg-gray-800 transition-all shadow-sm hover:shadow-md">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl pt-28 px-6 pb-6 animate-in fade-in slide-in-from-top-10 duration-200">
          <nav className="flex flex-col gap-6 text-center">
            <Link href="/" className="text-2xl font-medium text-gray-900" onClick={() => setMobileMenuOpen(false)}>
              Explore
            </Link>
            {categories.map(cat => (
              <Link
                key={cat.slug}
                href={`/search?category=${cat.slug}`}
                className="text-2xl font-medium text-gray-600 hover:text-black"
                onClick={() => setMobileMenuOpen(false)}
              >
                {cat.name}
              </Link>
            ))}

            <div className="w-12 h-px bg-gray-200 mx-auto my-4" />

            {!isAuthenticated && (
              <div className="flex flex-col gap-4 max-w-xs mx-auto w-full">
                <Link href="/login" className="w-full py-3 text-lg font-medium text-gray-600 border border-gray-200 rounded-full">
                  Log In
                </Link>
                <Link href="/signup" className="w-full py-3 text-lg font-medium text-white bg-black rounded-full shadow-lg">
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
