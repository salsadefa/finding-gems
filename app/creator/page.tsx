'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/store';
import { mockWebsites, mockCreatorProfiles } from '@/lib/mockData';
import {
    Package,
    ArrowUpRight,
    Eye,
    Star,
    ExternalLink,
    Plus
} from 'lucide-react';

export default function CreatorDashboardPage() {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated || (user?.role !== 'creator' && user?.role !== 'admin')) {
        return (
            <div className="min-h-screen pt-32 pb-12 flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Creator Access Required</h1>
                <p className="text-gray-500 mb-6">Please log in as a creator to access this dashboard.</p>
                <Link href="/login" className="px-6 py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">
                    Log In
                </Link>
            </div>
        );
    }

    // Mock data for demo
    const creatorProfile = mockCreatorProfiles[0];
    const creatorWebsites = mockWebsites.filter(w => w.creatorId === 'user-2');

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Overview Content */}
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Actions */}
                <div className="flex justify-end">
                    <Link href="/creator/listings/new" className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-sm">
                        <Plus size={16} strokeWidth={2.5} />
                        New Listing
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Views */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group hover:border-blue-200 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start z-10">
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Views</div>
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
                                <Eye size={18} />
                            </div>
                        </div>
                        <div className="z-10">
                            <div className="text-2xl font-bold text-gray-900">{creatorWebsites.reduce((acc, w) => acc + w.viewCount, 0).toLocaleString()}</div>
                            <div className="text-xs text-blue-600 font-medium flex items-center gap-1 mt-1">
                                <ArrowUpRight size={12} /> +12% vs last month
                            </div>
                        </div>
                    </div>

                    {/* Outbound Clicks */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group hover:border-green-200 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start z-10">
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Outbound Clicks</div>
                            <div className="p-2 bg-green-50 rounded-lg text-green-600 group-hover:bg-green-100 transition-colors">
                                <ExternalLink size={18} />
                            </div>
                        </div>
                        <div className="z-10">
                            <div className="text-2xl font-bold text-gray-900">{creatorWebsites.reduce((acc, w) => acc + (w.clickCount || 0), 0).toLocaleString()}</div>
                            <div className="text-xs text-green-600 font-medium flex items-center gap-1 mt-1">
                                <ArrowUpRight size={12} /> +5% vs last week
                            </div>
                        </div>
                    </div>

                    {/* Active Listings */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group hover:border-purple-200 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start z-10">
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Listings</div>
                            <div className="p-2 bg-purple-50 rounded-lg text-purple-600 group-hover:bg-purple-100 transition-colors">
                                <Package size={18} />
                            </div>
                        </div>
                        <div className="z-10">
                            <div className="text-2xl font-bold text-gray-900">{creatorProfile.totalWebsites}</div>
                            <div className="text-xs text-gray-500 font-medium mt-1">
                                Across 3 categories
                            </div>
                        </div>
                    </div>

                    {/* Avg Rating */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group hover:border-yellow-200 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start z-10">
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Avg Rating</div>
                            <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600 group-hover:bg-yellow-100 transition-colors">
                                <Star size={18} />
                            </div>
                        </div>
                        <div className="z-10">
                            <div className="text-2xl font-bold text-gray-900">{creatorProfile.rating}</div>
                            <div className="text-xs text-gray-500 font-medium mt-1">
                                From {creatorProfile.reviewCount} reviews
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* My Listings Section */}
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-bold text-gray-900">Recent Listings</h2>
                            <Link href="/creator/listings" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">View All</Link>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {creatorWebsites.slice(0, 3).map(website => (
                                <div key={website.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4 group">
                                    <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 text-lg font-bold text-gray-400 overflow-hidden relative">
                                        {website.thumbnail && !website.thumbnail.includes('placeholder') ? <Image src={website.thumbnail} fill className="object-cover" alt={website.name} /> : website.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 truncate">{website.name}</h3>
                                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                            <span className="flex items-center gap-1"><Eye size={12} /> {website.viewCount} views</span>
                                            <span className="flex items-center gap-1"><Star size={12} className="text-yellow-400 fill-yellow-400" /> {website.rating}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${website.status === 'active' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                                            {website.status}
                                        </span>
                                        <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link href={`/creator/listings/${website.id}/edit`} className="text-xs font-medium text-gray-600 hover:text-black">Edit</Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Performing Listings */}
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-bold text-gray-900">Top Performing Listings</h2>
                            <Link href="/creator/listings" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">View All</Link>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {creatorWebsites.slice(0, 3).map(website => ( // In real app, sort by clicks/views first
                                <div key={website.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 text-lg font-bold text-gray-400 overflow-hidden relative">
                                        {website.thumbnail && !website.thumbnail.includes('placeholder') ? <Image src={website.thumbnail} fill className="object-cover" alt={website.name} /> : website.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 truncate">{website.name}</h3>
                                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                            <span className="flex items-center gap-1 font-medium text-gray-900"><ExternalLink size={12} className="text-green-600" /> {website.clickCount} clicks</span>
                                            <span className="flex items-center gap-1"><Eye size={12} /> {website.viewCount} views</span>
                                        </div>
                                    </div>
                                    <Link href={`/creator/analytics`} className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                                        Analytics
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
