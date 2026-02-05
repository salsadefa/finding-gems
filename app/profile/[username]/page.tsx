'use client';

import { use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { mockUsers, mockCreatorProfiles, mockWebsites } from '@/lib/mockData';
import WebsiteCard from '@/components/WebsiteCard';
import { ProfileSkeleton } from '@/components/Skeleton';
import { ShieldCheck, Instagram, Linkedin, Globe, MapPin } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/animations';

interface PageProps {
    params: Promise<{
        username: string;
    }>;
}

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

export default function CreatorProfilePage({ params }: PageProps) {
    const { username } = use(params);

    const user = mockUsers.find(u => u.username === username);

    if (!user || user.role !== 'creator') {
        notFound();
    }

    const profile = mockCreatorProfiles.find(p => p.userId === user.id);
    const creatorWebsites = mockWebsites.filter(w => w.creatorId === user.id);
    const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2);

    if (!profile) {
        notFound(); // Should ideally gracefully handle missing profile for valid user
    }

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
                            {user.avatar ? (
                                <Image
                                    src={user.avatar}
                                    alt={user.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <span className="text-4xl font-bold text-gray-400">{initials}</span>
                            )}
                        </motion.div>
                        
                        {profile.isVerified && (
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
                            {user.name}
                        </h1>
                        <p className="text-gray-500 text-lg font-medium">
                            {profile.role || profile.professionalBackground}
                            {profile.institution && <span className="text-gray-400"> {profile.institution}</span>}
                        </p>
                    </motion.div>

                    {/* Bio */}
                    <motion.div 
                        variants={fadeInUp}
                        className="max-w-2xl mx-auto mb-8"
                    >
                        <p className="text-gray-600 leading-relaxed text-center">
                            {profile.bio}
                        </p>
                    </motion.div>

                    {/* SECTION B: SOCIAL CONNECT */}
                    <motion.div 
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-wrap items-center justify-center gap-4"
                    >
                        {profile.socialLinks?.linkedin && (
                            <motion.a
                                variants={fadeInUp}
                                whileHover={{ scale: 1.1, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                href={profile.socialLinks.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group p-3 rounded-full border border-gray-200 text-gray-600 hover:text-[#0077b5] hover:border-[#0077b5] hover:bg-blue-50 transition-all flex items-center gap-2"
                                title="LinkedIn Profile"
                            >
                                <Linkedin size={20} />
                                <span className="text-sm font-medium hidden group-hover:inline-block">LinkedIn</span>
                            </motion.a>
                        )}

                        {profile.socialLinks?.x && (
                            <motion.a
                                variants={fadeInUp}
                                whileHover={{ scale: 1.1, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                href={profile.socialLinks.x}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group p-3 rounded-full border border-gray-200 text-gray-600 hover:text-black hover:border-black hover:bg-gray-50 transition-all flex items-center gap-2"
                                title="X (Twitter) Profile"
                            >
                                <XIcon size={18} />
                                <span className="text-sm font-medium hidden group-hover:inline-block">X</span>
                            </motion.a>
                        )}

                        {profile.socialLinks?.instagram && (
                            <motion.a
                                variants={fadeInUp}
                                whileHover={{ scale: 1.1, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                href={profile.socialLinks.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group p-3 rounded-full border border-gray-200 text-gray-600 hover:text-[#E1306C] hover:border-[#E1306C] hover:bg-pink-50 transition-all flex items-center gap-2"
                                title="Instagram Profile"
                            >
                                <Instagram size={20} />
                                <span className="text-sm font-medium hidden group-hover:inline-block">Instagram</span>
                            </motion.a>
                        )}

                        {profile.socialLinks?.tiktok && (
                            <motion.a
                                variants={fadeInUp}
                                whileHover={{ scale: 1.1, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                href={profile.socialLinks.tiktok}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group p-3 rounded-full border border-gray-200 text-gray-600 hover:text-black hover:border-black hover:bg-gray-50 transition-all flex items-center gap-2"
                                title="TikTok Profile"
                            >
                                <TikTokIcon size={18} />
                                <span className="text-sm font-medium hidden group-hover:inline-block">TikTok</span>
                            </motion.a>
                        )}

                        {profile.socialLinks?.website && (
                            <motion.a
                                variants={fadeInUp}
                                whileHover={{ scale: 1.1, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                href={profile.socialLinks.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group p-3 rounded-full border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-600 hover:bg-blue-50 transition-all flex items-center gap-2"
                                title="Personal Website"
                            >
                                <Globe size={20} />
                                <span className="text-sm font-medium hidden group-hover:inline-block">Website</span>
                            </motion.a>
                        )}
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
                            More from {user.name.split(' ')[0]}
                        </h2>
                        <span className="text-sm text-gray-500 font-medium">
                            {creatorWebsites.length} {creatorWebsites.length === 1 ? 'App' : 'Apps'}
                        </span>
                    </motion.div>

                    {creatorWebsites.length > 0 ? (
                        <motion.div 
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {creatorWebsites.map((website, index) => (
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
