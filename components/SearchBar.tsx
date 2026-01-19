'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { mockWebsites } from '@/lib/mockData';
import { Website } from '@/lib/types';

export default function SearchBar() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Website[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Debounce search logic
    useEffect(() => {
        const timer = setTimeout(() => {
            // 1. Strict Length Check (>= 3 chars)
            if (query.trim().length >= 3) {
                const lowerQuery = query.toLowerCase();

                // 2. Strict Name Matching Only
                const filtered = mockWebsites.filter(site =>
                    site.name.toLowerCase().includes(lowerQuery)
                ).slice(0, 5);

                setResults(filtered);
                setIsOpen(true);
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev > 0 ? prev - 1 : -1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex >= 0 && results[activeIndex]) {
                router.push(`/website/${results[activeIndex].slug}`);
                setIsOpen(false);
            } else if (query) {
                router.push(`/search?q=${encodeURIComponent(query)}`);
                setIsOpen(false);
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            inputRef.current?.blur();
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
                inputRef.current && !inputRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative w-full max-w-md group z-50">
            {/* Search Input */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-gray-900 transition-colors">
                    <Search size={20} />
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => { if (query.trim().length >= 3) setIsOpen(true); }}
                    placeholder="Search for tools, AI assistants..."
                    className="w-full pl-11 pr-6 py-4 bg-white border border-gray-200 rounded-full text-sm outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100 transition-all shadow-sm hover:shadow-md"
                />

            </div>

            {/* Floating Dropdown */}
            {isOpen && (
                <div
                    ref={dropdownRef}
                    className="absolute top-[calc(100%+12px)] left-0 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ring-1 ring-black/5"
                >
                    {results.length > 0 ? (
                        <div className="py-2">
                            <div className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-white">
                                Top Results
                            </div>

                            {results.map((website, index) => (
                                <Link
                                    key={website.id}
                                    href={`/website/${website.slug}`}
                                    className={`
                    flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors mx-2 rounded-xl
                    ${index === activeIndex ? 'bg-gray-50' : 'hover:bg-gray-50'}
                  `}
                                    onClick={() => setIsOpen(false)}
                                    onMouseEnter={() => setActiveIndex(index)}
                                >
                                    {/* 1. Image (Soft Square) */}
                                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-gray-100 shadow-sm relative">
                                        {website.thumbnail ? (
                                            <Image src={website.thumbnail} alt={website.name} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                                                <span className="text-lg font-bold text-gray-400">{website.name.charAt(0)}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* 2 & 3. Text Stack (Vertical) */}
                                    <div className="flex flex-col flex-1 min-w-0 justify-center">
                                        <span className="text-sm font-medium text-gray-900 leading-tight truncate">
                                            {website.name}
                                        </span>
                                        <span className="text-xs text-gray-500 mt-0.5 truncate">
                                            {website.category.name}
                                        </span>
                                    </div>
                                </Link>
                            ))}

                            <div className="mt-2 border-t border-gray-100 pt-2 pb-1 px-2">
                                <Link
                                    href={`/search?q=${encodeURIComponent(query)}`}
                                    className="w-full flex items-center justify-center gap-2 py-3 text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    View all results for &quot;{query}&quot;
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="py-8 text-center px-4">
                            <p className="text-sm text-gray-500">
                                No tools found matching <span className="font-semibold text-gray-900">&quot;{query}&quot;</span>
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
