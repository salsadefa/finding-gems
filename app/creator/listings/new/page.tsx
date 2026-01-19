'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, useToast } from '@/lib/store';
import { mockCategories } from '@/lib/mockData';
import { ArrowLeft, Upload, Save, Check, Info } from 'lucide-react';

export default function NewListingPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);

    if (!isAuthenticated || (user?.role !== 'creator' && user?.role !== 'admin')) {
        return (
            <div className="min-h-screen pt-32 pb-12 flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Creator Access Required</h1>
                <p className="text-gray-500 mb-6">Please log in as a creator to add listings.</p>
                <Link href="/login" className="px-6 py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">
                    Log In
                </Link>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 1000));
        setLoading(false);
        showToast('Listing created successfully!', 'success');
        router.push('/creator/listings');
    };

    const inputClasses = "w-full h-12 px-4 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all";
    const textareaClasses = "w-full min-h-[120px] p-4 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all resize-y";
    const labelClasses = "block text-sm font-semibold text-gray-900 mb-1.5";
    const sectionClasses = "bg-white border border-gray-200 rounded-xl p-8 mb-8 shadow-sm";
    const sectionHeaderClasses = "text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100 flex items-center gap-2";

    return (
        <div className="min-h-screen bg-gray-50/50">
            <div className="max-w-4xl mx-auto px-6 pt-32 pb-32">

                {/* Header */}
                <div className="mb-10">
                    <Link href="/creator?tab=listings" className="inline-flex items-center gap-2 text-gray-500 hover:text-black font-medium text-sm mb-6 transition-colors group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Create New Listing</h1>
                    <p className="text-gray-500 text-lg">Fill in the details to publish your product to the marketplace.</p>
                </div>

                <form onSubmit={handleSubmit}>

                    {/* Basic Info Section */}
                    <div className={sectionClasses}>
                        <h2 className={sectionHeaderClasses}>
                            <Info size={20} className="text-blue-600" />
                            Basic Information
                        </h2>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClasses}>Website Name <span className="text-red-500">*</span></label>
                                    <input type="text" className={inputClasses} placeholder="e.g., DocuGen Pro" required />
                                </div>
                                <div>
                                    <label className={labelClasses}>Category <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <select className={`${inputClasses} appearance-none cursor-pointer`}>
                                            <option value="" disabled selected>Select a category</option>
                                            {mockCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className={labelClasses}>Short Description <span className="text-red-500">*</span></label>
                                <input type="text" className={inputClasses} placeholder="Brief one-line description for cards (max 100 chars)" maxLength={100} required />
                                <p className="text-xs text-gray-500 mt-1.5 text-right">0/100</p>
                            </div>

                            <div>
                                <label className={labelClasses}>Full Description <span className="text-red-500">*</span></label>
                                <textarea className={textareaClasses} placeholder="Detailed description of your website, features, and benefits..." required />
                            </div>

                            <div>
                                <label className={labelClasses}>External URL <span className="text-red-500">*</span></label>
                                <input type="url" className={inputClasses} placeholder="https://your-website.com" required />
                            </div>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className={sectionClasses}>
                        <h2 className={sectionHeaderClasses}>
                            <Check size={20} className="text-green-600" />
                            Product Details
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label className={labelClasses}>Tech Stack</label>
                                <input type="text" className={inputClasses} placeholder="React, Node.js, PostgreSQL (comma separated)" />
                                <p className="text-xs text-gray-500 mt-1.5">Helps buyers understand what technology your product is built with.</p>
                            </div>

                            <div>
                                <label className={labelClasses}>Use Cases</label>
                                <textarea className={textareaClasses} placeholder="List real-world scenarios where your website is useful..." />
                            </div>
                        </div>
                    </div>

                    {/* Pricing Section */}
                    <div className={sectionClasses}>
                        <h2 className={sectionHeaderClasses}>
                            <Save size={20} className="text-purple-600" />
                            Pricing & Access
                        </h2>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClasses}>Pricing Type <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <select className={`${inputClasses} appearance-none cursor-pointer`}>
                                            <option value="lifetime">Lifetime Access</option>
                                            <option value="subscription">Subscription</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClasses}>Price (IDR) <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</div>
                                        <input type="number" className={`${inputClasses} pl-10`} placeholder="199000" required />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <input type="checkbox" id="trial" className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black accent-black" />
                                <label htmlFor="trial" className="text-sm font-medium text-gray-900 cursor-pointer select-none">
                                    Enable Free Trial
                                    <p className="text-xs text-gray-500 font-normal mt-0.5">Allow users to try the product for a limited time before purchasing.</p>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Media Section (Placeholder for now as per plan, but good to have) */}
                    <div className={sectionClasses}>
                        <h2 className={sectionHeaderClasses}>
                            <Upload size={20} className="text-orange-600" />
                            Media
                        </h2>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer group">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-500 group-hover:bg-white group-hover:text-black group-hover:shadow-sm transition-all">
                                <Upload size={24} />
                            </div>
                            <p className="text-sm font-semibold text-gray-900">Click to upload thumbnail</p>
                            <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG or GIF (max. 2MB)</p>
                        </div>
                    </div>

                    {/* Sticky Action Bar */}
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-50">
                        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
                            <span className="text-sm text-gray-500 hidden sm:inline-block">Unsaved changes</span>
                            <div className="flex items-center gap-3 ml-auto">
                                <button type="button" onClick={() => router.back()} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-black transition-colors focus:ring-2 focus:ring-gray-200">
                                    Save as Draft
                                </button>
                                <button type="submit" disabled={loading} className="px-6 py-2.5 text-sm font-semibold text-white bg-black rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm flex items-center gap-2">
                                    {loading ? 'Publishing...' : 'Publish Listing'}
                                </button>
                            </div>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
}
