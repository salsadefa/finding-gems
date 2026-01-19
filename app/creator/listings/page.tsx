'use client';

import Link from 'next/link';
import Image from 'next/image';
import { mockWebsites } from '@/lib/mockData';
import EmptyState, { EmptyListingsIcon } from '@/components/EmptyState';
import Button from '@/components/Button';
import { Plus, Eye, Star } from 'lucide-react';

export default function CreatorListingsPage() {
    const creatorWebsites = mockWebsites.filter(w => w.creatorId === 'user-2'); // Mock user

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">My Listings</h2>
                    <p className="text-gray-500 mt-1">Manage your software and tool listings.</p>
                </div>
                <Link href="/creator/listings/new" className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">
                    <Plus size={18} />
                    New Listing
                </Link>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                {creatorWebsites.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        <div className="grid grid-cols-[2fr_1fr_0.7fr_0.7fr_0.8fr_1.2fr] gap-4 p-6 bg-gray-50 text-xs font-semibold uppercase text-gray-500 tracking-wider">
                            <span>Website</span>
                            <span>Category</span>
                            <span>Views</span>
                            <span>Rating</span>
                            <span>Status</span>
                            <span>Actions</span>
                        </div>
                        {creatorWebsites.map(website => (
                            <div key={website.id} className="grid grid-cols-[2fr_1fr_0.7fr_0.7fr_0.8fr_1.2fr] gap-4 p-6 hover:bg-gray-50 transition-colors items-center group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 text-lg font-bold text-gray-400 overflow-hidden relative">
                                        {website.thumbnail && !website.thumbnail.includes('placeholder') ? (
                                            <Image src={website.thumbnail} fill className="object-cover" alt={website.name} />
                                        ) : (
                                            website.name.charAt(0)
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-gray-900 truncate">{website.name}</h3>
                                        <p className="text-xs text-gray-500 truncate max-w-[200px]">{website.shortDescription}</p>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600">{website.category.name}</div>
                                <div className="text-sm text-gray-600">{website.viewCount}</div>
                                <div className="text-sm text-gray-600 flex items-center gap-1">
                                    <Star size={14} className="text-yellow-400 fill-yellow-400" /> {website.rating}
                                </div>
                                <div>
                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${website.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' :
                                            website.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                                'bg-gray-100 text-gray-600 border-gray-200'
                                        }`}>
                                        {website.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link href={`/website/${website.slug}`} className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-black transition-colors focus:ring-2 focus:ring-gray-200">
                                        View
                                    </Link>
                                    <Link href={`/creator/listings/${website.id}/edit`} className="px-3 py-1.5 text-xs font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors focus:ring-2 focus:ring-gray-200">
                                        Edit
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={<EmptyListingsIcon />}
                        title="No listings yet"
                        description="Create your first website listing to start driving traffic."
                        action={<Link href="/creator/listings/new"><Button>Create Listing</Button></Link>}
                    />
                )}
            </div>
        </div>
    );
}
