'use client';

import { useState } from 'react';
import { 
  useAdminUsers,
  useUpdateUser,
} from '@/lib/api/admin';
import { TableSkeleton } from '@/components/Skeleton';
import {
  Search,
  Users,
  X,
  Loader2,
} from 'lucide-react';

function EmptyState({ message, icon: Icon }: { message: string; icon?: React.ElementType }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-gray-400">
      {Icon && <Icon size={48} className="mb-4 opacity-20" />}
      <p>{message}</p>
    </div>
  );
}

export default function UsersTab() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'user' | 'creator' | 'admin' | ''>('');
  
  const { data, isLoading, error } = useAdminUsers({ 
    page, 
    limit: 10, 
    role: roleFilter || undefined,
    search: search || undefined
  });
  const updateUser = useUpdateUser();
  const [selectedUser, setSelectedUser] = useState<NonNullable<typeof data>['users'][0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRole, setNewRole] = useState<'user' | 'creator' | 'admin'>('user');

  const handleUpdateRole = async (userId: string, role: 'user' | 'creator' | 'admin') => {
    await updateUser.mutateAsync({ id: userId, data: { role } });
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className="max-w-7xl relative">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Users Management</h2>
          <p className="text-sm text-gray-500 mt-1">Manage all users and their roles</p>
        </div>
        <div className="flex gap-3">
          <div className="inline-flex rounded-md shadow-sm">
            {(['', 'user', 'creator', 'admin'] as const).map((role) => (
              <button
                key={role || 'all'}
                onClick={() => setRoleFilter(role)}
                className={`px-4 py-2 text-sm font-medium border ${
                  roleFilter === role 
                    ? 'bg-blue-50 text-blue-700 border-blue-300' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                } ${
                  role === '' ? 'rounded-l-lg' : ''
                } ${
                  role === 'admin' ? 'rounded-r-lg' : 'border-r-0'
                }`}
              >
                {role ? role.charAt(0).toUpperCase() + role.slice(1) : 'All'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, username, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : error ? (
          <EmptyState message="Error loading users" />
        ) : data?.users?.length === 0 ? (
          <EmptyState message="No users found" icon={Users} />
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-500">User</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-500">Role</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-500">Joined</th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-500">Websites</th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-500">Orders</th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.users?.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold border border-white shadow-sm">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">@{user.username}</div>
                          <div className="text-xs text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : user.role === 'creator'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-gray-50 text-gray-700 border border-gray-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          user.role === 'admin' ? 'bg-purple-500' : 
                          user.role === 'creator' ? 'bg-blue-500' : 'bg-gray-500'
                        }`}></span>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">
                      {user._count?.websites || 0}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">
                      {user._count?.orders || 0}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setNewRole(user.role);
                          setIsModalOpen(true);
                        }}
                        className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                      >
                        Edit Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {data?.pagination && data.pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-medium">{(page - 1) * 10 + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(page * 10, data.pagination.total)}</span> of{' '}
                  <span className="font-medium">{data.pagination.total}</span> results
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={!data.pagination.hasPrev}
                    className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm font-medium text-gray-700">
                    Page {page} of {data.pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={!data.pagination.hasNext}
                    className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Update User Role</h3>
                  <p className="text-sm text-gray-500 mt-1">{selectedUser.name} (@{selectedUser.username})</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Role</label>
                <div className="space-y-2">
                  {(['user', 'creator', 'admin'] as const).map((role) => (
                    <button
                      key={role}
                      onClick={() => setNewRole(role)}
                      className={`w-full p-3 rounded-lg border text-left flex items-center gap-3 ${
                        newRole === role 
                          ? role === 'admin'
                            ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500'
                            : role === 'creator'
                            ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                            : 'border-gray-500 bg-gray-50 ring-1 ring-gray-500'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full ${
                        role === 'admin' ? 'bg-purple-500' : 
                        role === 'creator' ? 'bg-blue-500' : 'bg-gray-500'
                      }`} />
                      <div>
                        <div className="font-medium text-gray-900 capitalize">{role}</div>
                        <div className="text-xs text-gray-500">
                          {role === 'admin' && 'Full access to all features'}
                          {role === 'creator' && 'Can create and sell websites'}
                          {role === 'user' && 'Can browse and purchase websites'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 px-4 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateRole(selectedUser.id, newRole)}
                disabled={updateUser.isPending || newRole === selectedUser.role}
                className="flex-1 py-2.5 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {updateUser.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Update Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
