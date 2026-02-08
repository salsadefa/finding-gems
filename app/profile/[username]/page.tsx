'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { useCreatorProfile } from '@/lib/api/users';
import WebsiteCard from '@/components/WebsiteCard';
import { ProfileSkeleton } from '@/components/Skeleton';
import { ShieldCheck, Instagram, Linkedin, Globe, MapPin, AlertCircle } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/animations';

// Custom TikTok Icon since it's not in Lucide
const TikTokIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
    </svg>
);

// Custom X Icon
const XIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
);

export default function CreatorProfilePage() {
    const params = useParams();
    const username = params.username as string;
    const [avatarError, setAvatarError] = useState(false);

    const { data, isLoading, error } = useCreatorProfile(username);

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-white">
                <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
                    <ProfileSkeleton />
                </div>
            </div>
        );
    }

    // Error or not found
    if (error || !data?.creator) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Creator not found</h1>
                <p className="text-gray-500 mb-6">The creator profile you&apos;re looking for doesn&apos;t exist.</p>
                <Link 
                    href="/search" 
                    className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Browse Creators
                </Link>
            </div>
        );
    }

    const { creator, websites } = data;
    const profile = creator.creator_profiles;
    
    // Get initials for avatar fallback
    const initials = creator.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

    const avatarSrc = creator.avatar ?? '';

    const isValidImageSrc = (src?: string) => {
        if (!src) return false;
        const trimmed = src.trim();
        if (!trimmed) return false;
        if (trimmed.startsWith('/')) return true;
        try {
            const url = new URL(trimmed);
            return [
                'ui-avatars.com',
                'images.unsplash.com',
                'via.placeholder.com',
                'picsum.photos',
            ].includes(url.hostname);
        } catch {
            return false;
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-white"
        >
            <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">

                {/* SECTION A: PROFILE HEADER */}
                <motion.div 
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col items-center text-center mb-12"
                >

                    {/* Avatar */}
                    <motion.div 
                        variants={fadeInUp}
                        whileHover={{ scale: 1.05 }}
                        className="relative mb-6"
                    >
                        <motion.div 
                            whileHover={{ boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                            className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center"
                        >
                            {isValidImageSrc(avatarSrc) && !avatarError ? (
                                <Image
                                    src={avatarSrc}
                                    alt={creator.name}
                                    fill
                                    className="object-cover"
                                    onError={() => setAvatarError(true)}
                                />
                            ) : (
                                <span className="text-4xl font-bold text-gray-400">{initials}</span>
                            )}
                        </motion.div>
                        
                        {profile?.isVerified && (
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30, delay: 0.3 }}
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                className="absolute bottom-1 right-1 bg-blue-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm" 
                                title="Verified Creator"
                            >
                                <ShieldCheck size={16} />
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Name & Role */}
                    <motion.div variants={fadeInUp} className="space-y-2 mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
                            {creator.name}
                        </h1>
                        <p className="text-gray-500 text-lg font-medium">
                            {profile?.professionalBackground || 'Creator'}
                            {profile?.expertise && profile.expertise.length > 0 && (
                                <span className="text-gray-400"> · {profile.expertise.slice(0, 3).join(', ')}</span>
                            )}
                        </p>
                    </motion.div>

                    {/* Bio */}
                    <motion.div 
                        variants={fadeInUp}
                        className="max-w-2xl mx-auto mb-8"
                    >
                        <p className="text-gray-600 leading-relaxed text-center">
                            {profile?.bio || 'No bio available'}
                        </p>
                    </motion.div>

                    {/* Stats */}
                    <motion.div 
                        variants={fadeInUp}
                        className="flex items-center justify-center gap-8 mb-8"
                    >
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{websites.length}</div>
                            <div className="text-sm text-gray-500">Websites</div>
                        </div>
                        <div className="w-px h-10 bg-gray-200"></div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">⭐ {profile?.rating?.toFixed(1) || '0.0'}</div>
                            <div className="text-sm text-gray-500">{profile?.reviewCount || 0} Reviews</div>
                        </div>
                        <div className="w-px h-10 bg-gray-200"></div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">
                                {new Date(creator.createdAt).getFullYear()}
                            </div>
                            <div className="text-sm text-gray-500">Joined</div>
                        </div>
                    </motion.div>

                    {/* SECTION B: SOCIAL CONNECT */}
                    <motion.div 
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-wrap items-center justify-center gap-4"
                    >
                        {/* Note: Social links tidak ada di API response saat ini */}
                        {/* Bisa ditambahkan nanti kalau backend support */}
                    </motion.div>

                </motion.div>

                {/* divider */}
                <motion.div 
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="w-full h-px bg-gray-100 my-12 origin-left"
                />

                {/* SECTION C: APPS BY CREATOR */}
                <motion.div 
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={fadeInUp} className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">
                            More from {creator.name.split(' ')[0]}
                        </h2>
                        <span className="text-sm text-gray-500 font-medium">
                            {websites.length} {websites.length === 1 ? 'App' : 'Apps'}
                        </span>
                    </motion.div>

                    {websites.length > 0 ? (
                        <motion.div 
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {websites.map((website, index) => (
                                <motion.div
                                    key={website.id}
                                    variants={fadeInUp}
                                    whileHover={{ y: -5 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <WebsiteCard website={website} showCreator={false} />
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500"
                        >
                            <p>No listings found for this creator.</p>
                        </motion.div>
                    )}
                </motion.div>

            </div>
        </motion.div>
    );
}
