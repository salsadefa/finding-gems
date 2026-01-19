'use client';

import { Settings } from 'lucide-react';

export default function CreatorSettingsPage() {
    return (
        <div className="p-8 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>

            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                    <Settings size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Account Settings</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                    Manage your profile, account preferences, and notifications here. This section is coming soon.
                </p>
            </div>
        </div>
    );
}
