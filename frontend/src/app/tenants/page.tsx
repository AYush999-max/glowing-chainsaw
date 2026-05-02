'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { tenantAPI } from '@/lib/api';
import { Building, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

interface Tenant {
  _id: string;
  name: string;
  kycVerified: boolean;
  licenseVerified: boolean;
  documents: string[];
  createdAt: string;
}

export default function TenantsPage() {
  const { user } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await tenantAPI.getTenants();
        setTenants(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load tenants');
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRoles={['owner']}>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Manage Tenants</h1>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenants.map((tenant) => (
              <div key={tenant._id} className="bg-white shadow rounded-lg p-6">
                <div className="flex items-start">
                  <Building className="h-8 w-8 text-blue-600 flex-shrink-0" />
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{tenant.name}</h3>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center">
                        {tenant.kycVerified ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <span className="ml-2 text-sm">
                          KYC: {tenant.kycVerified ? 'Verified' : 'Pending'}
                        </span>
                      </div>

                      <div className="flex items-center">
                        {tenant.licenseVerified ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <span className="ml-2 text-sm">
                          License: {tenant.licenseVerified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-gray-500">
                      Created: {new Date(tenant.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {tenants.length === 0 && (
            <div className="text-center py-12">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No tenants found</p>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
