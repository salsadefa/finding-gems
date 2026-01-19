'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, List, BarChart2, Settings, UserCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/store';
import Image from 'next/image';

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const navigation = [
        { name: 'Overview', href: '/creator', icon: LayoutDashboard },
        { name: 'My Listings', href: '/creator/listings', icon: List },
        { name: 'Analytics', href: '/creator/analytics', icon: BarChart2 },
        { name: 'Settings', href: '/creator/settings', icon: Settings },
    ];

    const getPageTitle = () => {
        const activeNav = navigation.find(nav => nav.href === pathname);
        return activeNav ? activeNav.name : 'Dashboard';
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col">
                {/* Brand */}
                <div className="flex items-center h-16 px-6 border-b border-gray-100">
                    <Link href="/" className="flex items-center gap-2 font-bold text-gray-900 text-lg">
                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white text-xs">DL</div>
                        Dualangka Creator
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon size={18} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile Footer */}
                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 relative">
                            {user?.avatar ? (
                                <Image src={user.avatar} fill className="object-cover" alt={user.name} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-xs">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'Creator'}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors" title="Log out">
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 min-w-0 min-h-screen flex flex-col">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-20">
                    <h1 className="text-xl font-bold text-gray-900">{getPageTitle()}</h1>
                    <div className="flex items-center gap-4">
                        {/* Add extra header controls if needed here */}
                    </div>
                </header>

                {/* Content Body */}
                <div className="flex-1">
                    {children}
                </div>
            </main>
        </div>
    );
}
