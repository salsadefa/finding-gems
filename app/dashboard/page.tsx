'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, useBookmarks } from '@/lib/store';
import { formatDate } from '@/lib/utils';
import WebsiteCard from '@/components/WebsiteCard';
import EmptyState, { EmptyBookmarksIcon } from '@/components/EmptyState';
import Button from '@/components/Button';
import { Settings } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/animations';

type Tab = 'bookmarks' | 'reviews';

export default function DashboardPage() {
    const { user, isAuthenticated } = useAuth();
    const { bookmarks } = useBookmarks();
    const [activeTab, setActiveTab] = useState<Tab>('bookmarks');

    if (!isAuthenticated) {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="min-h-screen pt-32 pb-12 flex flex-col items-center justify-center text-center px-4"
            >
                <motion.h1 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl font-bold text-gray-900 mb-2"
                >
                    Please log in
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-500 mb-6"
                >
                    You need to be logged in to view your dashboard.
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Link href="/login" className="inline-block px-6 py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">
                        Log In
                    </Link>
                </motion.div>
            </motion.div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gray-50/50"
        >
            <div className="max-w-5xl mx-auto px-6 lg:px-8 pt-32 pb-24">

                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
                >
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                            Welcome back, {user?.name || 'User'}
                        </h1>
                        <p className="text-gray-500 mt-1 text-lg">Manage your tools and reviews.</p>
                    </motion.div>
                    
                    <motion.button 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
                    >
                        <Settings size={16} />
                        Settings
                    </motion.button>
                </motion.div>

                {/* Creator CTA - Show only for non-creators */}
                <AnimatePresence>
                    {user && user.role !== 'creator' && user.role !== 'admin' && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            className="mb-10 p-6 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl text-white flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <h3 className="text-lg font-semibold mb-1">🚀 Have tools to share?</h3>
                                <p className="text-gray-300 text-sm">Become a creator and share your websites with our community.</p>
                            </motion.div>
                            
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Link href="/for-creators">
                                    <Button className="bg-white text-gray-900 hover:bg-gray-100 whitespace-nowrap">
                                        Become a Creator
                                    </Button>
                                </Link>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Tabs */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-8 border-b border-gray-200 mb-10"
                >
                    <motion.button
                        onClick={() => setActiveTab('bookmarks')}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className={`pb-4 text-sm font-semibold tracking-wide transition-colors relative ${activeTab === 'bookmarks' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Saved Tools <span className="ml-1.5 py-0.5 px-2 bg-gray-100 text-gray-600 rounded-full text-xs">{bookmarks.length}</span>
                        {activeTab === 'bookmarks' && (
                            <motion.div 
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 w-full h-0.5 bg-black rounded-full"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                        )}
                    </motion.button>
                    
                    <motion.button
                        onClick={() => setActiveTab('reviews')}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className={`pb-4 text-sm font-semibold tracking-wide transition-colors relative ${activeTab === 'reviews' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        My Reviews
                        {activeTab === 'reviews' && (
                            <motion.div 
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 w-full h-0.5 bg-black rounded-full"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                        )}
                    </motion.button>
                </motion.div>

                {/* Content */}
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === 'bookmarks' && (
                            bookmarks.length > 0 ? (
                                <motion.div 
                                    variants={staggerContainer}
                                    initial="hidden"
                                    animate="visible"
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                >
                                    {bookmarks.map((bookmark, index) => (
                                        <motion.div 
                                            key={bookmark.id}
                                            variants={fadeInUp}
                                            whileHover={{ y: -5 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <WebsiteCard website={bookmark.website} />
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="py-12"
                                >
                                    <EmptyState
                                        icon={<EmptyBookmarksIcon />}
                                        title="No bookmarks yet"
                                        description="Save websites you're interested in for later."
                                        action={
                                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                                <Link href="/"><Button>Explore Websites</Button></Link>
                                            </motion.div>
                                        }
                                    />
                                </motion.div>
                            )
                        )}

                        {activeTab === 'reviews' && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-12 border border-dashed border-gray-200 rounded-xl bg-gray-50/50"
                            >
                                <EmptyState 
                                    title="No reviews yet" 
                                    description="Share your experiences with tools you've used to help others." 
                                />
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
