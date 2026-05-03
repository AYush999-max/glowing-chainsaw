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
  plan: 'free' | 'standard' | 'premium';
  licenseKey?: string;
  benefits?: string[];
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
  const [actionMessage, setActionMessage] = useState('');
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantPlan, setNewTenantPlan] = useState<'free' | 'standard' | 'premium'>('free');
  const [newTenantLicenseKey, setNewTenantLicenseKey] = useState('');
  const [creatingTenant, setCreatingTenant] = useState(false);
  const [licenseInputs, setLicenseInputs] = useState<Record<string, string>>({});
  const [showCreateForm, setShowCreateForm] = useState(true);

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

  const handleVerifyKYC = async (tenantId: string) => {
    setError('');
    setActionMessage('');
    setVerifyingId(tenantId);

    try {
      const response = await tenantAPI.verifyKYC(tenantId);
      setTenants((prev) => prev.map((tenant) => tenant._id === tenantId ? response.data.tenant : tenant));
      setActionMessage(`KYC verified for ${response.data.tenant.name}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify KYC');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleVerifyLicense = async (tenantId: string) => {
    setError('');
    setActionMessage('');
    setVerifyingId(tenantId);

    try {
      const licenseKey = licenseInputs[tenantId] || '';
      const response = await tenantAPI.verifyLicense(tenantId, licenseKey);
      setTenants((prev) => prev.map((tenant) => tenant._id === tenantId ? response.data.tenant : tenant));
      setActionMessage(`License verified for ${response.data.tenant.name}`);
      setLicenseInputs((prev) => ({ ...prev, [tenantId]: '' }));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify license');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setActionMessage('');
    setCreatingTenant(true);

    try {
      const tenantData = {
        name: newTenantName,
        plan: newTenantPlan,
        licenseKey: newTenantLicenseKey || undefined,
      };

      const response = await tenantAPI.createTenant(tenantData);
      const createdTenant = response.data.tenant || response.data;
      setTenants((prev) => [createdTenant, ...prev]);
      setActionMessage(response.data.message || `Tenant ${createdTenant.name} created on ${createdTenant.plan} plan`);
      setNewTenantName('');
      setNewTenantPlan('free');
      setNewTenantLicenseKey('');
    } catch (err: any) {
      const details = err.response?.data?.details;
      setError(
        details && Array.isArray(details)
          ? details.join(', ')
          : err.response?.data?.message || 'Failed to create tenant'
      );
    } finally {
      setCreatingTenant(false);
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
    <ProtectedRoute requiredRoles={['owner']}>
      <div className="min-h-screen bg-slate-950 text-white">
        <header className="bg-slate-900 shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white">Manage Tenants</h1>
              <Link
                href="/dashboard"
                className="text-sky-300 hover:text-white"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {error && (
            <div className="bg-red-700 border border-red-600 text-white px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Tenant Controls</h2>
              <p className="text-sm text-slate-400">Create new tenants or manage existing tenants from this page.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateForm((prev) => !prev)}
              className="inline-flex items-center justify-center rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-400"
            >
              {showCreateForm ? 'Hide create tenant form' : 'Show create tenant form'}
            </button>
          </div>

          {actionMessage && (
            <div className="bg-emerald-700 border border-emerald-600 text-white px-4 py-3 rounded mb-4">
              {actionMessage}
            </div>
          )}

          {showCreateForm && (
            <div className="bg-white rounded-lg shadow p-6 mb-6 text-slate-900">
              <h2 className="text-xl font-semibold mb-4">Create new tenant</h2>
              <form onSubmit={handleCreateTenant} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="tenantName" className="block text-sm font-medium text-slate-700">Tenant Name</label>
                    <input
                      id="tenantName"
                      type="text"
                      required
                      value={newTenantName}
                      onChange={(e) => setNewTenantName(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="e.g. New Tenant"
                    />
                  </div>
                  <div>
                    <label htmlFor="tenantPlan" className="block text-sm font-medium text-slate-700">Plan</label>
                    <select
                      id="tenantPlan"
                      value={newTenantPlan}
                      onChange={(e) => setNewTenantPlan(e.target.value as 'free' | 'standard' | 'premium')}
                      className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="free">Free</option>
                      <option value="standard">Standard</option>
                      <option value="premium">Premium</option>
                    </select>
                    <p className="mt-2 text-sm text-slate-500">
                      Free tenants are activated immediately without a license key. Standard and Premium tenants require a valid key.
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      {newTenantPlan === 'free' && 'Free plan includes basic platform access only.'}
                      {newTenantPlan === 'standard' && 'Standard plan includes enhanced reporting and support.'}
                      {newTenantPlan === 'premium' && 'Premium plan includes priority support, advanced analytics, and custom integrations.'}
                    </p>
                  </div>
                  {newTenantPlan !== 'free' && (
                    <div>
                      <label htmlFor="licenseKey" className="block text-sm font-medium text-slate-700">License Key</label>
                      <input
                        id="licenseKey"
                        type="text"
                        value={newTenantLicenseKey}
                        onChange={(e) => setNewTenantLicenseKey(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="Enter license key for paid plans"
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={creatingTenant}
                    className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {creatingTenant ? 'Creating...' : 'Create Tenant'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenants.map((tenant) => (
              <div key={tenant._id} className="bg-slate-800 shadow-lg shadow-black/10 rounded-lg p-6 border border-slate-700">
                <div className="flex items-start">
                  <Building className="h-8 w-8 text-sky-300 flex-shrink-0" />
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-lg font-semibold text-white">{tenant.name}</h3>
                      <span className="rounded-full bg-slate-700 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300">
                        {tenant.plan || 'free'}
                      </span>
                    </div>
                    
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center">
                        {tenant.kycVerified ? (
                          <CheckCircle className="h-5 w-5 text-emerald-400" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-400" />
                        )}
                        <span className="ml-2 text-sm text-slate-300">
                          KYC: {tenant.kycVerified ? 'Verified' : 'Pending'}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {tenant.licenseVerified ? (
                              <CheckCircle className="h-5 w-5 text-emerald-400" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-400" />
                            )}
                            <span className="ml-2 text-sm text-slate-300">
                              License: {tenant.licenseVerified ? 'Verified' : 'Pending'}
                            </span>
                          </div>
                          {!tenant.licenseVerified && (
                            <div className="flex flex-col gap-2">
                              <input
                                type="text"
                                value={licenseInputs[tenant._id] || ''}
                                onChange={(e) => setLicenseInputs((prev) => ({ ...prev, [tenant._id]: e.target.value }))}
                                className="w-full rounded-md border border-slate-600 bg-slate-900 px-2 py-1 text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm"
                                placeholder="License key"
                              />
                              <button
                                type="button"
                                disabled={verifyingId === tenant._id}
                                onClick={() => handleVerifyLicense(tenant._id)}
                                className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-sky-500 text-white hover:bg-sky-400 disabled:opacity-50"
                              >
                                {verifyingId === tenant._id ? 'Verifying...' : 'Verify'}
                              </button>
                            </div>
                          )}
                        </div>
                        {tenant.licenseKey && (
                          <p className="mt-2 text-xs text-slate-400">Stored key: {tenant.licenseKey}</p>
                        )}
                      </div>

                      {tenant.benefits && tenant.benefits.length > 0 && (
                        <div className="mt-3 rounded-md bg-slate-900 p-3 text-xs text-slate-300">
                          <p className="font-medium text-slate-100">Benefits</p>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            {tenant.benefits.map((benefit) => (
                              <li key={benefit}>{benefit}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <p className="mt-3 text-xs text-slate-400">
                      Created: {new Date(tenant.createdAt).toLocaleDateString()}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href={`/users?tenantId=${tenant._id}`}
                        className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-sky-500 text-white hover:bg-sky-400"
                      >
                        Manage users
                      </Link>
                    </div>

                    {!tenant.kycVerified && (
                      <button
                        type="button"
                        disabled={verifyingId === tenant._id}
                        onClick={() => handleVerifyKYC(tenant._id)}
                        className="mt-4 inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-400 disabled:opacity-50"
                      >
                        {verifyingId === tenant._id ? 'Verifying...' : 'Verify KYC'}
                      </button>
                    )}
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
