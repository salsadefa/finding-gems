'use client';

import { useState } from 'react';
import {
  Shield,
  Users,
  Save,
  Plus,
  Settings,
  X,
} from 'lucide-react';

export default function SettingsTab() {
  const [settingsTab, setSettingsTab] = useState<'general' | 'team' | 'audit'>('general');
  const [generalSettings, setGeneralSettings] = useState({
    platformName: 'Finding Gems',
    supportEmail: 'support@findinggems.com',
    maintenanceMode: false
  });
  const [adminTeam, setAdminTeam] = useState([
    { id: 1, name: 'Admin User', email: 'admin@findinggems.com', role: 'Superadmin', status: 'Active' }
  ]);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Admin' | 'Superadmin'>('Admin');
  const [isSuperAdmin] = useState(true);

  const handleInviteAdmin = () => {
    const newId = adminTeam.length + 1;
    setAdminTeam([...adminTeam, { id: newId, name: 'New Admin', email: inviteEmail, role: inviteRole, status: 'Pending' }]);
    setInviteModalOpen(false);
    setInviteEmail('');
  };

  return (
    <div className="max-w-5xl mx-auto min-h-[80vh]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="text-sm text-gray-500 mt-1">Manage platform configuration and access</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
          isSuperAdmin ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
        }`}>
          <Shield size={12} />
          {isSuperAdmin ? 'Superadmin' : 'Admin'} Mode
        </span>
      </div>

      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8" aria-label="Tabs">
          {(['general', 'team', 'audit'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSettingsTab(tab)}
              className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                settingsTab === tab 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'general' && <Settings size={16} className={`mr-2 ${settingsTab === tab ? 'text-blue-500' : 'text-gray-400'}`} />}
              {tab === 'team' && <Users size={16} className={`mr-2 ${settingsTab === tab ? 'text-blue-500' : 'text-gray-400'}`} />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

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
                    className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      generalSettings.maintenanceMode ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                      generalSettings.maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                    }`} />
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
              <button 
                onClick={() => setInviteModalOpen(true)} 
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 text-sm shadow-sm transition-colors"
              >
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
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        admin.role === 'Superadmin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {admin.role === 'Superadmin' && <Shield size={10} />}
                        {admin.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        admin.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
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
            <div className="p-8 text-center text-gray-400">
              Audit logs will be available in a future update.
            </div>
          </div>
        )}
      </div>

      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Invite New Admin</h3>
              <button onClick={() => setInviteModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={inviteEmail} 
                  onChange={(e) => setInviteEmail(e.target.value)} 
                  className="w-full rounded-lg border-gray-300 border p-2.5" 
                  placeholder="colleague@findinggems.com" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['Admin', 'Superadmin'] as const).map((role) => (
                    <button 
                      key={role}
                      onClick={() => setInviteRole(role)} 
                      className={`p-3 rounded-lg border text-left ${
                        inviteRole === role 
                          ? role === 'Superadmin' 
                            ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500' 
                            : 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-bold text-sm text-gray-900">{role}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {role === 'Superadmin' ? 'Full access control' : 'Can manage content'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <button 
                onClick={handleInviteAdmin} 
                className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 mt-2"
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
