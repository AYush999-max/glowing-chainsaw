import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (userData: any) =>
    api.post('/auth/register', userData),
  getProfile: () =>
    api.get('/auth/profile'),
};

export const userAPI = {
  getUsers: (tenantId: string) =>
    api.get(`/users/${tenantId}`),
  createUser: (userData: any) =>
    api.post('/users', userData),
  updateUser: (id: string, userData: any) =>
    api.put(`/users/${id}`, userData),
  deleteUser: (id: string) =>
    api.delete(`/users/${id}`),
};

export const tenantAPI = {
  getTenants: () =>
    api.get('/tenants'),
  getTenant: (id: string) =>
    api.get(`/tenants/${id}`),
  createTenant: (tenantData: any) =>
    api.post('/tenants', tenantData),
  updateTenant: (id: string, tenantData: any) =>
    api.put(`/tenants/${id}`, tenantData),
  verifyKYC: (id: string) =>
    api.post(`/tenants/${id}/verify-kyc`),
  verifyLicense: (id: string) =>
    api.post(`/tenants/${id}/verify-license`),
};

export const dataAPI = {
  submitData: (formData: FormData) =>
    api.post('/data', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getData: (tenantId: string) =>
    api.get(`/data/${tenantId}`),
  getMySubmissions: () =>
    api.get('/data/my/submissions'),
  reviewData: (id: string, reviewData: any) =>
    api.put(`/data/${id}/review`, reviewData),
  approveData: (id: string) =>
    api.put(`/data/${id}/approve`),
};

export const dashboardAPI = {
  getStats: () =>
    api.get('/dashboard/stats'),
  getAnalytics: () =>
    api.get('/dashboard/analytics'),
};

export const auditAPI = {
  getLogs: (params?: any) =>
    api.get('/audit', { params }),
  getMyActivity: () =>
    api.get('/audit/my-activity'),
};

export default api;