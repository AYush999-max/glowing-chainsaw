'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { dataAPI } from '@/lib/api';
import { CheckCircle, XCircle, Eye } from 'lucide-react';

interface DataItem {
  _id: string;
  formData: any;
  images: string[];
  status: string;
  userId: { email: string };
  createdAt: string;
  reviewComments?: string;
}

export default function DataPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedData, setSelectedData] = useState<DataItem | null>(null);
  const [reviewForm, setReviewForm] = useState({
    status: 'reviewed',
    comments: ''
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const response = await dataAPI.getData(user!.tenantId);
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (dataId: string) => {
    try {
      if (reviewForm.status === 'approved') {
        await dataAPI.approveData(dataId);
      } else {
        await dataAPI.reviewData(dataId, reviewForm);
      }
      setSelectedData(null);
      setReviewForm({ status: 'reviewed', comments: '' });
      fetchData();
    } catch (error) {
      console.error('Failed to review data:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
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
    <ProtectedRoute requiredRoles={['manager', 'admin']}>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <h1 className="text-3xl font-bold text-gray-900">Data Review</h1>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {data.map((item) => (
                <li key={item._id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {item.userId.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.formData.productName || 'Unnamed Product'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Submitted by {item.userId.email} • {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          Quantity: {item.formData.quantity} • Location: {item.formData.location}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                      <button
                        onClick={() => setSelectedData(item)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
              {data.length === 0 && (
                <li className="px-6 py-4 text-center text-gray-500">
                  No data submissions found
                </li>
              )}
            </ul>
          </div>

          {/* Review Modal */}
          {selectedData && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Review Data Submission</h3>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Product Details</h4>
                      <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Product Name</dt>
                          <dd className="text-sm text-gray-900">{selectedData.formData.productName}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Quantity</dt>
                          <dd className="text-sm text-gray-900">{selectedData.formData.quantity}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Location</dt>
                          <dd className="text-sm text-gray-900">{selectedData.formData.location}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Description</dt>
                          <dd className="text-sm text-gray-900">{selectedData.formData.description || 'N/A'}</dd>
                        </div>
                      </dl>
                      {selectedData.formData.notes && (
                        <div className="mt-2">
                          <dt className="text-sm font-medium text-gray-500">Notes</dt>
                          <dd className="text-sm text-gray-900">{selectedData.formData.notes}</dd>
                        </div>
                      )}
                    </div>

                    {selectedData.images && selectedData.images.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Images</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {selectedData.images.map((image, index) => (
                            <img
                              key={index}
                              src={`http://localhost:5000/${image}`}
                              alt={`Image ${index + 1}`}
                              className="w-full h-24 object-cover rounded"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium mb-2">Review Action</h4>
                      <div className="space-y-2">
                        <select
                          value={reviewForm.status}
                          onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          <option value="reviewed">Mark as Reviewed</option>
                          <option value="approved">Approve</option>
                          <option value="rejected">Reject</option>
                        </select>
                        <textarea
                          placeholder="Review comments..."
                          value={reviewForm.comments}
                          onChange={(e) => setReviewForm({ ...reviewForm, comments: e.target.value })}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => setSelectedData(null)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReview(selectedData._id)}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Submit Review
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}