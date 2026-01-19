'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth, useBookmarks } from '@/lib/store';
import { formatDate } from '@/lib/utils';
import WebsiteCard from '@/components/WebsiteCard';
import EmptyState, { EmptyBookmarksIcon } from '@/components/EmptyState';
import Button from '@/components/Button';
import { Settings } from 'lucide-react';

type Tab = 'bookmarks' | 'reviews';

export default function DashboardPage() {
    const { user, isAuthenticated } = useAuth();
    const { bookmarks } = useBookmarks();
    const [activeTab, setActiveTab] = useState<Tab>('bookmarks');

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen pt-32 pb-12 flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Please log in</h1>
                <p className="text-gray-500 mb-6">You need to be logged in to view your dashboard.</p>
                <Link href="/login" className="px-6 py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">
                    Log In
                </Link>
            </div>
        );
    }

    // No purchases or trials logic needed


    return (
        <div className="min-h-screen bg-gray-50/50">
            <div className="max-w-5xl mx-auto px-6 lg:px-8 pt-32 pb-24">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back, {user?.name || 'User'}</h1>
                        <p className="text-gray-500 mt-1 text-lg">Manage your tools and reviews.</p>
                    </div>
                    <button className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm">
                        <Settings size={16} />
                        Settings
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-8 border-b border-gray-200 mb-10">
                    <button
                        onClick={() => setActiveTab('bookmarks')}
                        className={`pb-4 text-sm font-semibold tracking-wide transition-colors relative ${activeTab === 'bookmarks' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Saved Tools <span className="ml-1.5 py-0.5 px-2 bg-gray-100 text-gray-600 rounded-full text-xs">{bookmarks.length}</span>
                        {activeTab === 'bookmarks' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black rounded-full" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`pb-4 text-sm font-semibold tracking-wide transition-colors relative ${activeTab === 'reviews' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        My Reviews
                        {activeTab === 'reviews' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black rounded-full" />}
                    </button>
                </div>

                {/* Content */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Purchases tab content removed */}


                    {activeTab === 'bookmarks' && (
                        bookmarks.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {bookmarks.map(bookmark => (
                                    <WebsiteCard key={bookmark.id} website={bookmark.website} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-12">
                                <EmptyState
                                    icon={<EmptyBookmarksIcon />}
                                    title="No bookmarks yet"
                                    description="Save websites you're interested in for later."
                                    action={<Link href="/"><Button>Explore Websites</Button></Link>}
                                />
                            </div>
                        )
                    )}

                    {activeTab === 'reviews' && (
                        <div className="py-12 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                            <EmptyState title="No reviews yet" description="Share your experiences with tools you've used to help others." />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
