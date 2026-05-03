'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI, tenantAPI } from '@/lib/api';
import { UserPlus, Edit, Trash2 } from 'lucide-react';

interface User {
  _id: string;
  email: string;
  role: string;
  tenantId: string;
  createdAt: string;
}

interface TenantOption {
  _id: string;
  name: string;
}

export default function UsersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>(user?.tenantId || '');
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'engineer',
    tenantId: user?.tenantId || ''
  });

  useEffect(() => {
    if (!user) return;

    if (typeof window === 'undefined') return;
    const queryTenantId = new URLSearchParams(window.location.search).get('tenantId');
    if (user.role === 'owner' && queryTenantId) {
      setSelectedTenantId(queryTenantId);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    if (user.role === 'owner') {
      fetchTenants();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (!selectedTenantId) return;

    fetchUsers(selectedTenantId);
  }, [user, selectedTenantId]);

  const fetchTenants = async () => {
    try {
      const response = await tenantAPI.getTenants();
      setTenants(response.data);
      if (!selectedTenantId && response.data.length > 0) {
        setSelectedTenantId(response.data[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch tenants:', error);
    }
  };

  const fetchUsers = async (tenantId: string) => {
    try {
      const response = await userAPI.getUsers(tenantId);
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tenantId = user?.role === 'owner' ? selectedTenantId : user!.tenantId;
      await userAPI.createUser({ ...formData, tenantId });
      setShowCreateForm(false);
      setFormData({ email: '', password: '', role: 'engineer', tenantId });
      fetchUsers(tenantId);
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await userAPI.deleteUser(userId);
        const tenantId = user?.role === 'owner' ? selectedTenantId : user!.tenantId;
        if (tenantId) fetchUsers(tenantId);
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRoles={['owner', 'admin']}>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {user?.role === 'owner' && (
            <div className="bg-white shadow rounded-lg mb-6 p-4">
              <label htmlFor="tenantSelect" className="block text-sm font-medium text-gray-700 mb-2">
                Select tenant to manage
              </label>
              <select
                id="tenantSelect"
                value={selectedTenantId}
                onChange={(e) => {
                  const tenantId = e.target.value;
                  setSelectedTenantId(tenantId);
                  router.replace(`/users?tenantId=${tenantId}`);
                }}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {tenants.map((tenant) => (
                  <option key={tenant._id} value={tenant._id}>
                    {tenant.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Create User Form */}
          {showCreateForm && (
            <div className="bg-white shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Create New User</h3>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                      Role
                    </label>
                    <select
                      id="role"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="engineer">Engineer</option>
                      <option value="manager">Manager</option>
                      {user?.role === 'owner' && <option value="admin">Admin</option>}
                    </select>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Create User
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Users Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {users.map((user) => (
                <li key={user._id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.email}</div>
                        <div className="text-sm text-gray-500">
                          Role: {user.role} • Joined: {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                      {user.role !== 'owner' && (
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
              {users.length === 0 && (
                <li className="px-6 py-4 text-center text-gray-500">
                  No users found
                </li>
              )}
            </ul>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}