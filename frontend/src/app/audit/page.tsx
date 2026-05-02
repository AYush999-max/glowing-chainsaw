'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { auditAPI } from '@/lib/api';
import { Activity } from 'lucide-react';
import Link from 'next/link';

interface AuditLog {
  _id: string;
  userId: { email: string };
  action: string;
  timestamp: string;
  details?: any;
}

export default function AuditPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        if (user?.role === 'owner' || user?.role === 'admin') {
          const response = await auditAPI.getLogs();
          setLogs(response.data.logs || response.data);
        } else {
          const response = await auditAPI.getMyActivity();
          setLogs(response.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load activity logs');
        console.error('Audit fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchLogs();
    }
  }, [user]);

  const filteredLogs = filter === 'all'
    ? logs
    : logs.filter(log => log.action === filter);

  const actions = [...new Set(logs.map(log => log.action))];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
              <Link
                href="/dashboard"
                className="text-blue-600 hover:text-blue-700"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Filter */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Filter by Action
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-gray-900"
            >
              <option value="all">All Actions</option>
              {actions.map(action => (
                <option key={action} value={action}>
                  {action.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Activity List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Activity ({filteredLogs.length})
              </h2>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <div key={log._id} className="px-6 py-4 flex items-center space-x-4 hover:bg-gray-50">
                  <Activity className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {log.userId?.email || 'Unknown User'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {log.action.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm text-gray-900">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {filteredLogs.length === 0 && (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No activity logs found</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
