'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/store';
import { mockPlatformStats, mockCreatorApplications, mockReports, mockCreatorProfiles, mockWebsites, mockUsers } from '@/lib/mockData';
import { formatPrice } from '@/lib/utils';
import {
    TrendingUp,
    MoreHorizontal,
    Search,
    Filter,
    Eye,
    Edit,
    Trash2,
    Star,
    CheckCircle,
    XCircle,
    Clock,
    Shield,
    X,
    Linkedin,
    Instagram,
    ExternalLink,
    Lock,
    Unlock,
    Monitor,
    Smartphone,
    CheckSquare,
    Globe,
    Maximize2,
    AlertTriangle,
    ChevronDown,
    Users,
    FileText,
    Save,
    Plus,
    Settings
} from 'lucide-react';

function AdminDashboardContent() {
    const searchParams = useSearchParams();
    const { user, isAuthenticated, isLoading } = useAuth();

    // Hooks must be at the top level
    const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);
    const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false); // Toggle for masking demo

    // Creators list derived from mock data - combine user and profile data
    const creatorsList = mockUsers
        .filter(u => u.role === 'creator')
        .map(user => {
            const profile = mockCreatorProfiles.find(p => p.userId === user.id);
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                joinedAt: new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                status: profile?.isVerified ? 'verified' : 'pending',
                totalProducts: profile?.totalWebsites || 0,
                profile: profile || null
            };
        });

    // Get selected creator object from ID
    const selectedCreator = creatorsList.find(c => c.id === selectedCreatorId) || null;

    // Handler functions
    const handleViewCreator = (creatorId: string) => {
        setSelectedCreatorId(creatorId);
        setIsSlideOverOpen(true);
    };

    const handleUpdateStatus = (status: string) => {
        // In a real app, this would update the creator status
        console.log('Updating creator status to:', status);
        setIsSlideOverOpen(false);
    };

    // Inspection modal state and handlers for Reports tab
    const [inspectionModal, setInspectionModal] = useState<{ isOpen: boolean; websiteId: string | null }>({
        isOpen: false,
        websiteId: null
    });
    const [inspectionChecklist, setInspectionChecklist] = useState({
        urlLoads: false,
        professional: false,
        safe: false
    });
    const [rejectReasonOpen, setRejectReasonOpen] = useState(false);
    const [inspectionMode, setInspectionMode] = useState<'screenshot' | 'live'>('screenshot');

    const inspectingWebsite = mockWebsites.find(w => w.id === inspectionModal.websiteId) || null;

    const handleOpenInspection = (websiteId: string) => {
        setInspectionModal({ isOpen: true, websiteId });
        setInspectionChecklist({ urlLoads: false, professional: false, safe: false });
        setInspectionMode('screenshot');
    };

    const handleInspectionAction = (action: 'approve' | 'reject') => {
        console.log('Inspection action:', action);
        setInspectionModal({ isOpen: false, websiteId: null });
        setRejectReasonOpen(false);
    };

    // Settings tab state
    const [settingsTab, setSettingsTab] = useState<'general' | 'team' | 'audit'>('general');
    const [generalSettings, setGeneralSettings] = useState({
        platformName: 'DualAngka',
        supportEmail: 'support@dualangka.com',
        maintenanceMode: false
    });
    const [adminTeam, setAdminTeam] = useState([
        { id: 1, name: 'Sarah Support', email: 'sarah@dualangka.com', role: 'Admin', status: 'Active' },
        { id: 2, name: 'John Admin', email: 'john@dualangka.com', role: 'Superadmin', status: 'Active' }
    ]);
    const [inviteModalOpen, setInviteModalOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<'Admin' | 'Superadmin'>('Admin');


    // Auth Check - wait for loading to complete
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || user?.role !== 'admin') {
        // Rely on layout or middleware, but fail safe here
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
                <div className="text-6xl mb-4">🚫</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                <p className="text-gray-500 mb-6">You don&apos;t have permission to access this page.</p>
                <a href="/" className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors">
                    Go Home
                </a>
            </div>
        );
    }

    const stats = mockPlatformStats;

    // Determine current "Tab" content based on URL, or show default Dashboard View
    // The user moved away from "Tabs on page" to "Sidebar Navigation".
    // So /admin is purely the Dashboard. Other links in sidebar point to ?tab=...
    // BUT, the request basically asks to restructure the Dashboard itself.
    // Let's assume /admin IS the Dashboard view mapped to the reference image.
    // If query param ?tab=creators is present, we might conditionally render that table instead.
    // For this step, I will Focus on the "Dashboard" view (Reference Image).
    // I will implement the Dashboard View when no tab or tab=dashboard.

    const tab = searchParams.get('tab');

    // CREATORS TAB
    if (tab === 'creators') {
        return (
            <div className="max-w-7xl relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Creators</h2>
                        <p className="text-sm text-gray-500 mt-1">Manage user verification and details</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="inline-flex rounded-md shadow-sm">
                            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-50">
                                All
                            </button>
                            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border-t border-b border-r border-gray-300 hover:bg-gray-50">
                                Pending
                            </button>
                            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border-t border-b border-gray-300 hover:bg-gray-50">
                                Verified
                            </button>
                            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-50">
                                Suspended
                            </button>
                        </div>
                    </div>
                </div>

                {/* Creators Table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left font-semibold text-gray-500">User</th>
                                <th className="px-6 py-4 text-left font-semibold text-gray-500">Joined</th>
                                <th className="px-6 py-4 text-left font-semibold text-gray-500">Total Products</th>
                                <th className="px-6 py-4 text-left font-semibold text-gray-500">Status</th>
                                <th className="px-6 py-4 text-right font-semibold text-gray-500">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {creatorsList.map((creator) => (
                                <tr key={creator.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold border border-white shadow-sm">
                                                {creator.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{creator.name}</div>
                                                <div className="text-xs text-gray-500">{creator.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{creator.joinedAt}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-900 font-medium">{creator.totalProducts} Products</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${creator.status === 'verified'
                                            ? 'bg-green-50 text-green-700 border border-green-200'
                                            : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${creator.status === 'verified' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                                            {creator.status === 'verified' ? 'Verified' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleViewCreator(creator.id)}
                                            className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Creator Detail Slide-over */}
                {isSlideOverOpen && selectedCreator && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40 transition-opacity"
                            onClick={() => setIsSlideOverOpen(false)}
                        />

                        {/* Slide-over Panel */}
                        <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-200 flex flex-col">
                            {/* Header */}
                            <div className="px-6 py-6 border-b border-gray-100 flex items-start justify-between bg-gray-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-white border-2 border-white shadow-md flex items-center justify-center text-xl font-bold text-gray-700 overflow-hidden relative">
                                        {/* Placeholder Avatar */}
                                        <Image src={`https://ui-avatars.com/api/?name=${selectedCreator.name}&background=random`} alt={selectedCreator.name} fill className="object-cover" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{selectedCreator.name}</h3>
                                        <p className="text-sm text-gray-500">{selectedCreator.email}</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">Creator</span>
                                            {selectedCreator.status === 'verified' && (
                                                <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                                    <CheckCircle size={12} /> Verified
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsSlideOverOpen(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Content Scroll Area */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-8">

                                {/* Verification Section */}
                                <section>
                                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Verification Check</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                    <Linkedin size={18} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">LinkedIn Profile</div>
                                                    <div className="text-xs text-gray-500">Connected 2 days ago</div>
                                                </div>
                                            </div>
                                            <a href={selectedCreator.profile?.socialLinks?.linkedin || '#'} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-600">
                                                <ExternalLink size={16} />
                                            </a>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-pink-50 text-pink-600 rounded-lg">
                                                    <Instagram size={18} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">Instagram</div>
                                                    <div className="text-xs text-gray-500">Connected 2 days ago</div>
                                                </div>
                                            </div>
                                            <a href={selectedCreator.profile?.socialLinks?.instagram || '#'} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-pink-600">
                                                <ExternalLink size={16} />
                                            </a>
                                        </div>
                                    </div>
                                </section>



                                {/* Product Portfolio */}
                                <section>
                                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Top Products</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {selectedCreator.profile?.otherProducts?.slice(0, 3).map((prod) => (
                                            <div key={prod.id} className="group relative aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                                <Image src={prod.thumbnail} alt={prod.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                                                    <span className="text-white text-xs font-medium truncate w-full">{prod.name}</span>
                                                </div>
                                            </div>
                                        )) || (
                                                <div className="col-span-2 text-sm text-gray-400 italic">No products uploaded yet.</div>
                                            )}
                                    </div>
                                </section>

                            </div>

                            {/* Footer Actions */}
                            <div className="p-6 border-t border-gray-100 bg-gray-50">
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleUpdateStatus('suspended')}
                                        className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-red-700 bg-white border border-red-200 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <XCircle size={16} />
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus('verified')}
                                        className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition-all hover:shadow-md"
                                    >
                                        <CheckCircle size={16} />
                                        Approve
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    }

    // WEBSITES TAB
    if (tab === 'websites') {
        return (
            <div className="max-w-7xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Website Management</h2>
                        <p className="text-sm text-gray-500 mt-1">Manage all websites listed on the platform</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                            <Filter size={16} />
                            Filter
                        </button>
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search websites..."
                                className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-xs font-medium text-gray-500 uppercase">Total Websites</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">{mockWebsites.length}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-xs font-medium text-gray-500 uppercase">Active</div>
                        <div className="text-2xl font-bold text-green-600 mt-1">
                            {mockWebsites.filter(w => w.status === 'active').length}
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-xs font-medium text-gray-500 uppercase">Pending</div>
                        <div className="text-2xl font-bold text-orange-600 mt-1">
                            {mockWebsites.filter(w => w.status === 'pending').length}
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-xs font-medium text-gray-500 uppercase">Avg Rating</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">
                            {(mockWebsites.reduce((acc, w) => acc + w.rating, 0) / mockWebsites.length).toFixed(1)}
                        </div>
                    </div>
                </div>

                {/* Websites Table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Website</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Creator</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Views</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rating</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {mockWebsites.map((website) => (
                                    <tr key={website.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-sm font-bold text-gray-400 overflow-hidden flex-shrink-0 relative">
                                                    {website.thumbnail && !website.thumbnail.includes('placeholder') ? (
                                                        <Image src={website.thumbnail} alt={website.name} fill className="object-cover" />
                                                    ) : (
                                                        website.name.charAt(0)
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-medium text-gray-900 truncate">{website.name}</div>
                                                    <div className="text-xs text-gray-500 truncate max-w-xs">{website.shortDescription}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{website.creator?.name}</div>
                                            <div className="text-xs text-gray-500">{website.creator?.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                {website.category?.name}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                <Eye size={14} className="text-gray-400" />
                                                {website.viewCount}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-sm text-gray-900">
                                                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                                {website.rating}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${website.status === 'active'
                                                ? 'bg-green-50 text-green-700 border border-green-100'
                                                : website.status === 'pending'
                                                    ? 'bg-orange-50 text-orange-700 border border-orange-100'
                                                    : website.status === 'suspended'
                                                        ? 'bg-red-50 text-red-700 border border-red-100'
                                                        : 'bg-gray-50 text-gray-700 border border-gray-100'
                                                }`}>
                                                {website.status === 'active' && <CheckCircle size={12} />}
                                                {website.status === 'pending' && <Clock size={12} />}
                                                {website.status === 'suspended' && <XCircle size={12} />}
                                                {website.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="View">
                                                    <Eye size={16} />
                                                </button>
                                                <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors" title="Edit">
                                                    <Edit size={16} />
                                                </button>
                                                <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                        <div className="text-sm text-gray-500">
                            Showing <span className="font-medium text-gray-900">1</span> to <span className="font-medium text-gray-900">{mockWebsites.length}</span> of <span className="font-medium text-gray-900">{mockWebsites.length}</span> results
                        </div>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>
                                Previous
                            </button>
                            <button className="px-3 py-1 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700">
                                1
                            </button>
                            <button className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // REPORTS / MODERATION TAB
    if (tab === 'reports') {
        const pendingSubmissions = mockWebsites.filter(w => w.status === 'pending');
        // If no pending, we can show a placeholder or mock one for demo if needed
        // For now, list real pending ones.

        return (
            <div className="max-w-7xl relative min-h-[calc(100vh-100px)]">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Moderation Queue</h2>
                        <p className="text-sm text-gray-500 mt-1">Review submissions and user reports</p>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Pending Submissions */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <Globe size={18} className="text-blue-500" />
                                    Review Submissions
                                </h3>
                                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full">{pendingSubmissions.length} Pending</span>
                            </div>
                            {pendingSubmissions.length > 0 ? (
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-white text-gray-500 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-3 font-medium">Website</th>
                                            <th className="px-6 py-3 font-medium">Creator</th>
                                            <th className="px-6 py-3 font-medium">Date</th>
                                            <th className="px-6 py-3 font-medium text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {pendingSubmissions.map(website => (
                                            <tr key={website.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900">{website.name}</div>
                                                    <div className="text-xs text-gray-500 truncate max-w-[150px]">{website.shortDescription}</div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">{website.creator?.name}</td>
                                                <td className="px-6 py-4 text-gray-400">Today</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleOpenInspection(website.id)}
                                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm">
                                                        Start Review
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-8 text-center text-gray-400">
                                    <CheckSquare size={48} className="mx-auto mb-4 opacity-20" />
                                    No pending website submissions.
                                </div>
                            )}
                        </div>

                        {/* Recent Reports */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <AlertTriangle size={18} className="text-red-500" />
                                    User Reports
                                </h3>
                                <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-0.5 rounded-full">0 Active</span>
                            </div>
                            <div className="p-8 text-center text-gray-400">
                                No active reports. Community is safe!
                            </div>
                        </div>
                    </div>

                    {/* Right: Quick Stats/Guidelines */}
                    <div className="space-y-6">
                        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                            <h4 className="font-bold text-blue-900 mb-2">Review Guidelines</h4>
                            <ul className="space-y-2 text-sm text-blue-800">
                                <li className="flex items-start gap-2">
                                    <span className="mt-1 block text-blue-500">•</span>
                                    Ensure the website actually works and loads within 5 seconds.
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1 block text-blue-500">•</span>
                                    Check for high quality UI/UX design.
                                </li>

                            </ul>
                        </div>
                    </div>
                </div>

                {/* INSPECTION MODAL */}
                {inspectionModal.isOpen && inspectingWebsite && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 font-sans">
                        {/* Backdrop */}
                        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setInspectionModal({ ...inspectionModal, isOpen: false })}></div>

                        {/* Modal Content */}
                        <div className="relative bg-white w-full max-w-[1400px] h-[85vh] rounded-2xl shadow-2xl flex overflow-hidden ring-1 ring-gray-900/5 animate-in fade-in zoom-in-95 duration-200">
                            {/* Left Side: Data & Controls */}
                            <div className="w-[380px] flex-shrink-0 bg-white border-r border-gray-200 flex flex-col z-10 relative shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                                {/* Header */}
                                <div className="p-6 border-b border-gray-100">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`w-2 h-2 rounded-full ${inspectingWebsite.status === 'pending' ? 'bg-yellow-400' : 'bg-green-400'}`}></span>
                                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Submission Review</p>
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900 truncate" title={inspectingWebsite.name}>{inspectingWebsite.name}</h3>
                                    <p className="text-xs text-gray-400 font-mono mt-0.5">ID: {inspectingWebsite.id.slice(0, 8)}...</p>
                                </div>

                                {/* Scrollable Data */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth">
                                    {/* Meta Info */}
                                    <section>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Overview</h4>
                                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 space-y-1">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-500">Category</span>
                                                <span className="text-sm font-medium text-gray-900">{inspectingWebsite.category?.name}</span>
                                            </div>
                                        </div>
                                    </section>


                                    {/* Creator */}
                                    <section>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Creator</h4>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-50 flex items-center justify-center text-blue-600 font-bold border border-white shadow-sm">
                                                {inspectingWebsite.creator?.name.charAt(0)}
                                            </div>
                                            <div className="overflow-hidden">
                                                <div className="font-bold text-gray-900 truncate">{inspectingWebsite.creator?.name}</div>
                                                <div className="text-xs text-gray-500 truncate">{inspectingWebsite.creator?.email}</div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Description */}
                                    <section>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Description</h4>
                                        <p className="text-sm text-gray-600 leading-relaxed text-justify bg-white">
                                            {inspectingWebsite.description || inspectingWebsite.shortDescription || "No description provided."}
                                        </p>
                                    </section>

                                    {/* External Link Block */}
                                    <section>
                                        <a href={inspectingWebsite.externalUrl} target="_blank" rel="noreferrer" className="group w-full py-4 px-4 bg-gray-900 text-white font-medium text-center rounded-xl hover:bg-black transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                                            Visit External Site <ExternalLink size={16} className="text-gray-400 group-hover:text-white transition-colors" />
                                        </a>
                                        <div className="text-center mt-2">
                                            <span className="text-[10px] text-gray-400">Opens in new tab</span>
                                        </div>
                                    </section>
                                </div>

                                {/* Footer: Checklist & Actions */}
                                <div className="p-6 bg-white border-t border-gray-200 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
                                    <div className="space-y-3 mb-6">
                                        <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer select-none group">
                                            <div onClick={() => setInspectionChecklist(p => ({ ...p, urlLoads: !p.urlLoads }))}
                                                className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 ${inspectionChecklist.urlLoads ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-transparent group-hover:border-green-400'}`}>
                                                <CheckSquare size={14} className={inspectionChecklist.urlLoads ? 'block' : 'hidden'} />
                                            </div>
                                            URL loads correctly
                                        </label>
                                        <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer select-none group">
                                            <div onClick={() => setInspectionChecklist(p => ({ ...p, professional: !p.professional }))}
                                                className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 ${inspectionChecklist.professional ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-transparent group-hover:border-green-400'}`}>
                                                <CheckSquare size={14} className={inspectionChecklist.professional ? 'block' : 'hidden'} />
                                            </div>
                                            High quality visualization
                                        </label>
                                        <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer select-none group">
                                            <div onClick={() => setInspectionChecklist(p => ({ ...p, safe: !p.safe }))}
                                                className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 ${inspectionChecklist.safe ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-transparent group-hover:border-green-400'}`}>
                                                <CheckSquare size={14} className={inspectionChecklist.safe ? 'block' : 'hidden'} />
                                            </div>
                                            No offensive/illegal content
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="relative">
                                            <button onClick={() => setRejectReasonOpen(!rejectReasonOpen)} className="w-full py-3 px-4 bg-white border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 hover:border-red-300 transition-colors flex items-center justify-center gap-2">
                                                Reject <ChevronDown size={14} />
                                            </button>
                                            {rejectReasonOpen && (
                                                <div className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-xl shadow-xl border border-gray-200 py-2 overflow-hidden z-30 animate-in slide-in-from-bottom-2 duration-200">
                                                    {['Broken Link', 'Low Quality', 'Inappropriate', 'Spam'].map(r => (
                                                        <button key={r} onClick={() => handleInspectionAction('reject')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors">{r}</button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleInspectionAction('approve')}
                                            disabled={!Object.values(inspectionChecklist).every(Boolean)}
                                            className="w-full py-3 px-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-500 hover:shadow-lg hover:shadow-green-500/20 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none">
                                            Approve
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Visual Verification */}
                            <div className="flex-1 bg-gray-100 flex flex-col relative overflow-hidden group">
                                {/* Toolbar */}
                                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md shadow-lg border border-gray-200/50 rounded-full p-1 flex z-20">
                                    <button onClick={() => setInspectionMode('screenshot')} className={`px-5 py-2 text-xs font-bold rounded-full transition-all duration-200 flex items-center gap-2 ${inspectionMode === 'screenshot' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
                                        <Monitor size={14} /> Screenshot
                                    </button>
                                    <button onClick={() => setInspectionMode('live')} className={`px-5 py-2 text-xs font-bold rounded-full transition-all duration-200 flex items-center gap-2 ${inspectionMode === 'live' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
                                        <Globe size={14} /> Live Preview
                                    </button>
                                </div>

                                <button
                                    onClick={() => setInspectionModal({ ...inspectionModal, isOpen: false })}
                                    className="absolute top-6 right-6 p-2 bg-white/80 backdrop-blur rounded-full text-gray-400 hover:text-gray-700 hover:bg-white shadow-sm border border-gray-200 transition-all z-20"
                                >
                                    <X size={20} />
                                </button>

                                {/* Viewport */}
                                <div className="flex-1 overflow-hidden flex items-center justify-center bg-gray-100/50 relative">
                                    <div className="absolute inset-0 pattern-grid-gray-200/50 opacity-20 pointer-events-none"></div>

                                    {inspectionMode === 'screenshot' ? (
                                        <div className="relative shadow-2xl rounded-lg overflow-hidden border-[8px] border-white w-[80vw] h-[75vh] transition-all duration-500 animate-in zoom-in-95 bg-white">
                                            {inspectingWebsite.thumbnail && !inspectingWebsite.thumbnail.includes('placeholder') ? (
                                                <Image src={inspectingWebsite.thumbnail} alt="Preview" fill className="object-contain" />
                                            ) : (
                                                <div className="w-[800px] h-[500px] bg-gray-50 flex flex-col items-center justify-center text-gray-300">
                                                    <Maximize2 size={48} className="mb-4 opacity-50" />
                                                    <span className="font-bold">No Screenshot Available</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-full h-full bg-white shadow-none animate-in fade-in duration-300">
                                            <div className="w-full h-full flex flex-col">
                                                <div className="h-10 bg-gray-50 border-b border-gray-200 flex items-center px-4 gap-2">
                                                    <div className="flex gap-1.5">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                                                        <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                                                    </div>
                                                    <div className="flex-1 flex justify-center px-4">
                                                        <div className="bg-white border border-gray-200 rounded text-[10px] text-gray-400 px-3 py-1 w-full max-w-[300px] text-center truncate">
                                                            {inspectingWebsite.externalUrl}
                                                        </div>
                                                    </div>
                                                </div>
                                                <iframe src={inspectingWebsite.externalUrl} className="flex-1 w-full bg-white" sandbox="allow-scripts allow-same-origin" title="Live Preview" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Mobile Check Reminder */}
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-yellow-50/90 backdrop-blur text-yellow-800 border border-yellow-200/50 px-5 py-2.5 rounded-full text-xs font-bold shadow-lg shadow-yellow-500/5 flex items-center gap-2 z-20 animate-bounce duration-[2000ms]">
                                    <Smartphone size={16} />
                                    <span>Did you check this site on mobile?</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // SETTINGS TAB
    if (tab === 'settings') {
        const handleInviteAdmin = () => {
            const newId = adminTeam.length + 1;
            setAdminTeam([...adminTeam, { id: newId, name: 'New Admin', email: inviteEmail, role: inviteRole, status: 'Active' }]);
            setInviteModalOpen(false);
            setInviteEmail('');
        };

        return (
            <div className="max-w-5xl mx-auto min-h-[80vh]">
                {/* Page Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                        <p className="text-sm text-gray-500 mt-1">Manage platform configuration and access</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isSuperAdmin ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                        <Shield size={12} />
                        {isSuperAdmin ? 'Superadmin' : 'Admin'} Mode
                    </span>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200 mb-8">
                    <nav className="flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setSettingsTab('general')}
                            className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${settingsTab === 'general' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            <Settings size={16} className={`mr-2 ${settingsTab === 'general' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                            General
                        </button>
                        <button
                            onClick={() => setSettingsTab('team')}
                            className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${settingsTab === 'team' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            <Users size={16} className={`mr-2 ${settingsTab === 'team' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                            Team & Roles
                        </button>
                        <button
                            onClick={() => setSettingsTab('audit')}
                            className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${settingsTab === 'audit' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            <FileText size={16} className={`mr-2 ${settingsTab === 'audit' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                            Audit Logs
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
                    {settingsTab === 'general' && (
                        <div className="p-8 max-w-2xl">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Platform Name</label>
                                    <input
                                        type="text"
                                        value={generalSettings.platformName}
                                        onChange={(e) => setGeneralSettings({ ...generalSettings, platformName: e.target.value })}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
                                    <input
                                        type="email"
                                        value={generalSettings.supportEmail}
                                        onChange={(e) => setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
                                    />
                                </div>


                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">Maintenance Mode</h4>
                                            <p className="text-xs text-gray-500 mt-1">Prevents public access during updates.</p>
                                        </div>
                                        <button
                                            onClick={() => setGeneralSettings({ ...generalSettings, maintenanceMode: !generalSettings.maintenanceMode })}
                                            className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${generalSettings.maintenanceMode ? 'bg-blue-600' : 'bg-gray-200'}`}
                                        >
                                            <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${generalSettings.maintenanceMode ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm">
                                        <Save size={16} /> Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {settingsTab === 'team' && (
                        <div>
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                                <h3 className="font-bold text-gray-900">Admin Management</h3>
                                <button onClick={() => setInviteModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 text-sm shadow-sm transition-colors">
                                    <Plus size={16} /> Invite New Admin
                                </button>
                            </div>
                            <table className="w-full text-sm text-left">
                                <thead className="bg-white text-gray-500 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">User</th>
                                        <th className="px-6 py-3 font-medium">Role</th>
                                        <th className="px-6 py-3 font-medium">Status</th>
                                        <th className="px-6 py-3 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {adminTeam.map(admin => (
                                        <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{admin.name}</div>
                                                <div className="text-xs text-gray-500">{admin.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${admin.role === 'Superadmin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {admin.role === 'Superadmin' && <Shield size={10} />}
                                                    {admin.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                                                    {admin.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-3 text-xs font-medium">
                                                    <button className="text-blue-600 hover:text-blue-800">Edit</button>
                                                    <button className="text-red-600 hover:text-red-800">Remove</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {settingsTab === 'audit' && (
                        <div>
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                                <h3 className="font-bold text-gray-900">Security Audit Log</h3>
                            </div>
                            <table className="w-full text-sm text-left">
                                <thead className="bg-white text-gray-500 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Admin</th>
                                        <th className="px-6 py-3 font-medium">Action</th>
                                        <th className="px-6 py-3 font-medium">Date</th>
                                        <th className="px-6 py-3 font-medium">IP Address</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-6 py-3 font-medium text-gray-900">Sarah Support</td>
                                        <td className="px-6 py-3 text-gray-600">Approved Website: TaskFlow</td>
                                        <td className="px-6 py-3 text-gray-500">Jan 12, 10:42 AM</td>
                                        <td className="px-6 py-3 text-gray-400 font-mono text-xs">192.168.1.42</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-6 py-3 font-medium text-gray-900">You</td>
                                        <td className="px-6 py-3 text-gray-600">Updated Settings</td>
                                        <td className="px-6 py-3 text-gray-500">Jan 11, 09:15 PM</td>
                                        <td className="px-6 py-3 text-gray-400 font-mono text-xs">10.0.0.1</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-6 py-3 font-medium text-gray-900">You</td>
                                        <td className="px-6 py-3 text-gray-600">Exported User Data</td>
                                        <td className="px-6 py-3 text-gray-500">Jan 10, 02:30 PM</td>
                                        <td className="px-6 py-3 text-gray-400 font-mono text-xs">10.0.0.1</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Invite Modal */}
                {
                    inviteModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold text-gray-900">Invite New Admin</h3>
                                    <button onClick={() => setInviteModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                        <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="w-full rounded-lg border-gray-300 border p-2.5" placeholder="colleague@dualangka.com" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button onClick={() => setInviteRole('Admin')} className={`p-3 rounded-lg border text-left ${inviteRole === 'Admin' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                                                <div className="font-bold text-sm text-gray-900">Admin</div>
                                                <div className="text-xs text-gray-500 mt-1">Can manage content</div>
                                            </button>
                                            <button onClick={() => setInviteRole('Superadmin')} className={`p-3 rounded-lg border text-left ${inviteRole === 'Superadmin' ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                                                <div className="font-bold text-sm text-gray-900">Superadmin</div>
                                                <div className="text-xs text-gray-500 mt-1">Full access control</div>
                                            </button>
                                        </div>
                                    </div>
                                    <button onClick={handleInviteAdmin} className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 mt-2">Send Invitation</button>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div >
        )
    }

    if (tab && tab !== 'dashboard') {
        return (
            <div className="max-w-5xl">
                <h2 className="text-2xl font-bold text-gray-900 capitalize mb-6">{tab}</h2>
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
                    {tab} module content placeholder. <br />
                    (In a real app, this would route to /admin/{tab})
                </div>
            </div>
        );
    }

    // DASHBOARD VIEW (Reference Look)
    return (
        <div className="max-w-6xl space-y-8">

            {/* 1. Header is handled by Layout, we just need the Content */}

            {/* 2. Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Users (Visitors)', value: stats.totalBuyers, trend: '+34%', color: 'blue' },
                    { label: 'Total Creators', value: stats.totalCreators, trend: '+12%', color: 'purple' },
                    { label: 'Active Websites', value: stats.totalWebsites, trend: '+5%', color: 'green' },
                    { label: 'Total Page Views', value: '45.2K', trend: '+22%', color: 'orange' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-36 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-gray-600">{stat.label}</span>
                            <MoreHorizontal size={16} className="text-gray-300" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</div>
                            <div className={`text-xs font-medium inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-${stat.color}-50 text-${stat.color}-600`}>
                                <TrendingUp size={12} /> {stat.trend}
                            </div>
                            <span className="text-xs text-gray-400 ml-2">vs last month</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* 3. Middle Section: Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Revenue Growth (Dummy Bar Chart) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-900">Traffic Growth</h3>
                        <select className="text-xs border-gray-200 rounded-lg text-gray-500 bg-gray-50 px-2 py-1">
                            <option>This Year</option>
                        </select>
                    </div>
                    {/* CSS Bar Chart Skeleton */}
                    <div className="h-64 flex items-end justify-between gap-2 px-2 pb-2">
                        {[40, 60, 45, 70, 50, 80, 65, 85, 75, 90, 60, 95].map((h, i) => (
                            <div key={i} className="w-full bg-blue-50 rounded-t-sm relative group">
                                <div
                                    className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-t-sm transition-all duration-500"
                                    style={{ height: `${h}%` }}
                                />
                                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded pointer-events-none">
                                    ${h}k
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-xs text-gray-400 uppercase tracking-wide px-2">
                        <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                        <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                    </div>
                </div>

                {/* Right: Category Distribution (Dummy Donut) */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-6">Category Distribution</h3>
                    <div className="flex flex-col items-center justify-center h-48 relative">
                        {/* CSS Donut Chart */}
                        <div className="w-40 h-40 rounded-full border-[16px] border-blue-500 border-r-purple-500 border-b-orange-400 border-l-blue-500 rotate-45 transform"></div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-gray-900">1,240</span>
                            <span className="text-xs text-gray-500">Total Items</span>
                        </div>
                    </div>
                    <div className="mt-6 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-500 rounded-full"></span>Productivity</div>
                            <span className="font-medium">45%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2"><span className="w-3 h-3 bg-purple-500 rounded-full"></span>Education</div>
                            <span className="font-medium">35%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2"><span className="w-3 h-3 bg-orange-400 rounded-full"></span>Admin Tools</div>
                            <span className="font-medium">20%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Bottom Section: Data Tables (Replacing Alerts) */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">Pending Actions</h3>
                    <div className="flex gap-2">
                        <span className="text-xs font-medium px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full">
                            {mockCreatorApplications.filter(a => a.status === 'pending').length} Verifications
                        </span>
                        <span className="text-xs font-medium px-2.5 py-1 bg-red-100 text-red-700 rounded-full">
                            {mockReports.filter(r => r.status === 'pending').length} Reports
                        </span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Subject</th>
                                <th className="px-6 py-3">Detail</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {/* Merge Apps and Reports for display */}
                            {[
                                ...mockCreatorApplications.filter(a => a.status === 'pending').map(a => ({ type: 'Verification', name: a.user.name, detail: a.professionalBackground, id: a.id, color: 'orange' })),
                                ...mockReports.filter(r => r.status === 'pending').map(r => ({ type: 'Report', name: r.website.name, detail: r.reason, id: r.id, color: 'red' }))
                            ].map((item, i) => (
                                <tr key={i} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-${item.color}-50 text-${item.color}-700 border border-${item.color}-100`}>
                                            {item.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{item.detail}</td>
                                    <td className="px-6 py-4 text-gray-400">Today</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-blue-600 hover:text-blue-800 font-medium text-xs">Review</button>
                                    </td>
                                </tr>
                            ))}
                            {[...mockCreatorApplications, ...mockReports].filter(i => i.status === 'pending').length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        No pending actions required. Good job!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}

export default function AdminDashboardPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
            </div>
        }>
            <AdminDashboardContent />
        </Suspense>
    );
}
