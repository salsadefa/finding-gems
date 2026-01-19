'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
    LayoutDashboard,
    Globe,
    Users,
    Shield,
    DollarSign,
    Settings,
    LogOut,
    Bell
} from 'lucide-react';
import { useAuth } from '@/lib/store';
import { Suspense } from 'react';

function SidebarContent() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user, logout } = useAuth();
    const currentTab = searchParams.get('tab');

    const navItems = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Websites', href: '/admin?tab=websites', icon: Globe },
        { name: 'Creators', href: '/admin?tab=creators', icon: Users },
        { name: 'Moderation', href: '/admin?tab=reports', icon: Shield },
        { name: 'Finance', href: '/admin?tab=finance', icon: DollarSign },
        { name: 'Settings', href: '/admin?tab=settings', icon: Settings },
    ];

    return (
        <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-30 hidden md:flex flex-col">
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-gray-100">
                <Link href="/" className="font-bold text-xl tracking-tight text-gray-900 flex items-center gap-2">
                    Dualangka
                    <span className="text-[10px] bg-gray-900 text-white px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold">Admin</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Main Menu</p>
                {navItems.map((item) => {
                    // Logic: 
                    // 1. If item has a query param (?tab=x), active if current url matches that param.
                    // 2. If item matches current path exactly (e.g. /admin/users) and no query param involved.
                    // 3. Special case: Dashboard (/admin) only active if NO tab is selected.

                    let isActive = false;

                    if (item.href.includes('?tab=')) {
                        const itemTab = item.href.split('?tab=')[1];
                        isActive = currentTab === itemTab;
                    } else if (item.href === '/admin') {
                        isActive = pathname === '/admin' && !currentTab;
                    } else {
                        // For future sub-routes (e.g. /admin/analytics)
                        isActive = pathname.startsWith(item.href);
                    }

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group ${isActive
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <item.icon size={18} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* User Info / Logout */}
            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                        {user?.name?.charAt(0) || 'A'}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'Admin'}</p>
                        <p className="text-xs text-gray-500 truncate">Administrator</p>
                    </div>
                </div>
                <button
                    onClick={() => logout()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-red-600 rounded-lg transition-colors"
                >
                    <LogOut size={16} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50 flex">

            {/* Sidebar Wrapped in Suspense because it uses useSearchParams */}
            <Suspense fallback={<div className="w-64 bg-white border-r border-gray-200 hidden md:flex" />}>
                <SidebarContent />
            </Suspense>

            {/* Main Content Area */}
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-20">
                    <div className="flex items-center text-sm text-gray-500">
                        <span className="font-medium text-gray-900">Dashboard</span>
                        {/* Breadcrumbs could go here */}
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 md:p-8 bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    );
}
