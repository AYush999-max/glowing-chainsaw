'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { dashboardAPI } from '@/lib/api';
import { Users, Building, FileText, Activity, LogOut, UserPlus, Settings, Menu, X } from 'lucide-react';
import Link from 'next/link';

interface Stats {
  totalUsers: number;
  totalTenants: number;
  totalData: number;
  dataByStatus: Record<string, number>;
  recentActivity: any[];
}

export default function MobileDashboardPage() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await dashboardAPI.getStats();
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
                <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        {menuOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setMenuOpen(false)}>
            <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Menu</h2>
              </div>
              <nav className="p-4 space-y-2">
                {(user?.role === 'owner' || user?.role === 'admin') && (
                  <>
                    <Link
                      href="/users"
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Users className="h-5 w-5" />
                      <span>Manage Users</span>
                    </Link>
                    <Link
                      href="/tenants"
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Building className="h-5 w-5" />
                      <span>Manage Tenants</span>
                    </Link>
                  </>
                )}
                {(user?.role === 'manager' || user?.role === 'admin') && (
                  <Link
                    href="/data"
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100"
                    onClick={() => setMenuOpen(false)}
                  >
                    <FileText className="h-5 w-5" />
                    <span>Review Data</span>
                  </Link>
                )}
                {user?.role === 'engineer' && (
                  <Link
                    href="/submit"
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100"
                    onClick={() => setMenuOpen(false)}
                  >
                    <UserPlus className="h-5 w-5" />
                    <span>Submit Data</span>
                  </Link>
                )}
                <Link
                  href="/audit"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  <Activity className="h-5 w-5" />
                  <span>Activity Logs</span>
                </Link>
              </nav>
            </div>
          </div>
        )}

        <main className="p-4 space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            {user?.role === 'engineer' && (
              <Link
                href="/submit"
                className="bg-blue-600 text-white p-4 rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
              >
                <UserPlus className="h-8 w-8 mb-2" />
                <span className="font-medium">Submit Data</span>
              </Link>
            )}
            {(user?.role === 'manager' || user?.role === 'admin') && (
              <Link
                href="/data"
                className="bg-green-600 text-white p-4 rounded-lg shadow-sm hover:bg-green-700 transition-colors"
              >
                <FileText className="h-8 w-8 mb-2" />
                <span className="font-medium">Review Data</span>
              </Link>
            )}
            {(user?.role === 'owner' || user?.role === 'admin') && (
              <Link
                href="/users"
                className="bg-purple-600 text-white p-4 rounded-lg shadow-sm hover:bg-purple-700 transition-colors"
              >
                <Users className="h-8 w-8 mb-2" />
                <span className="font-medium">Manage Users</span>
              </Link>
            )}
            <Link
              href="/audit"
              className="bg-orange-600 text-white p-4 rounded-lg shadow-sm hover:bg-orange-700 transition-colors"
            >
              <Activity className="h-8 w-8 mb-2" />
              <span className="font-medium">Activity</span>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Building className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active Tenants</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalTenants || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <FileText className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Data Submissions</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalData || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Activity className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pending Reviews</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.dataByStatus?.submitted || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-4 space-y-3">
              {stats?.recentActivity?.slice(0, 5).map((activity: any, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="p-1 bg-gray-100 rounded">
                    <Activity className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.userId?.email}</span> {activity.action.toLowerCase().replace('_', ' ')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                <p className="text-gray-500 text-center py-4">No recent activity</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}