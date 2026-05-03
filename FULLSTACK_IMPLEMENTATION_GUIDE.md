# Full-Stack Implementation Guide: Manager, Tenants & Activity

## 🎯 Problem Statement

Currently showing **nothing** for:
- Manager → Data Review Page
- Tenants → Tenant Management Page
- Activity → Activity Logs Page

**Root Cause:** Frontend pages exist but are not wired to backend APIs properly, or backend endpoints aren't returning test data.

---

## 📊 Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     DATABASE (MongoDB)                       │
├─────────────────────────────────────────────────────────────┤
│  Collections:                                               │
│  • users          (email, role, tenantId, password)         │
│  • tenants        (name, kycVerified, licenseVerified)      │
│  • data           (userId, tenantId, formData, status)      │
│  • auditlogs      (userId, action, timestamp)               │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │ mongoose queries
                            │
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js/Express)                │
├─────────────────────────────────────────────────────────────┤
│  Routes:                                                    │
│  • GET  /api/tenants              → all tenants (Owner)     │
│  • GET  /api/tenants/:id          → single tenant detail    │
│  • POST /api/data                 → submit data (Engineer)  │
│  • GET  /api/data/:tenantId       → get data               │
│  • PUT  /api/data/:id/review      → manager reviews        │
│  • PUT  /api/data/:id/approve     → admin approves         │
│  • GET  /api/audit                → activity logs          │
│  • GET  /api/dashboard/stats      → summary stats          │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │ axios/fetch requests
                            │
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js/React)                 │
├─────────────────────────────────────────────────────────────┤
│  Pages:                                                     │
│  • /dashboard         → calls GET /api/dashboard/stats      │
│  • /tenants           → calls GET /api/tenants              │
│  • /data              → calls GET /api/data/:tenantId       │
│  • /audit             → calls GET /api/audit                │
│  • /submit            → calls POST /api/data                │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │ browser renders
                            │
                    ┌───────────────┐
                    │  User Browser  │
                    └───────────────┘
```

---

## 📋 Implementation Checklist

### ✅ STEP 1: Backend - Verify APIs Return Data

#### 1.1 Dashboard Stats (GET /api/dashboard/stats)
**Should return:**
```json
{
  "totalUsers": 5,
  "totalTenants": 2,
  "totalData": 15,
  "dataByStatus": {
    "submitted": 8,
    "reviewed": 4,
    "approved": 3,
    "rejected": 0
  },
  "recentActivity": [
    {
      "_id": "...",
      "userId": { "email": "user@email.com" },
      "action": "SUBMIT_DATA",
      "timestamp": "2026-05-02T14:00:00Z"
    }
  ]
}
```

**Backend Code Location:** `backend/routes/dashboard.js` (Lines 11-60)

**Test with curl:**
```bash
curl -X GET http://localhost:5000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

#### 1.2 Tenants List (GET /api/tenants)
**Should return:**
```json
[
  {
    "_id": "69f60d94eede46527c44ba89",
    "name": "Demo Company",
    "kycVerified": true,
    "licenseVerified": true,
    "documents": [],
    "createdAt": "2026-05-02T14:43:32.537Z"
  }
]
```

**Backend Code Location:** `backend/routes/tenants.js` (Lines 9-25)

**Test with curl:**
```bash
curl -X GET http://localhost:5000/api/tenants \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

#### 1.3 Data/Submissions (GET /api/data/:tenantId)
**Should return:**
```json
[
  {
    "_id": "...",
    "userId": { "email": "engineer@test.com" },
    "tenantId": "69f60d94eede46527c44ba89",
    "formData": {
      "productName": "Product X",
      "quantity": 100,
      "location": "Warehouse A"
    },
    "images": ["url1.jpg", "url2.jpg"],
    "status": "submitted",
    "createdAt": "2026-05-02T15:30:00Z"
  }
]
```

**Backend Code Location:** `backend/routes/data.js` (Lines 32-50)

**Test with curl:**
```bash
curl -X GET http://localhost:5000/api/data/69f60d94eede46527c44ba89 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

#### 1.4 Activity Logs (GET /api/audit)
**Should return:**
```json
[
  {
    "_id": "...",
    "userId": {"email": "admin@test.com"},
    "tenantId": "69f60d94eede46527c44ba89",
    "action": "SUBMIT_DATA",
    "details": null,
    "timestamp": "2026-05-02T15:35:00Z"
  }
]
```

**Backend Code Location:** `backend/routes/audit.js` (Lines 8-30)

**Test with curl:**
```bash
curl -X GET http://localhost:5000/api/audit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

### ✅ STEP 2: Frontend - Connect Pages to APIs

#### 2.1 Create `/tenants` Page

**Create file:** `frontend/src/app/tenants/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { tenantAPI } from '@/lib/api';
import { Building, CheckCircle, XCircle, FileText } from 'lucide-react';
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

   ` fetchTenants();
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
                href="/tenants/new"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Add Tenant
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

                    <div className="mt-4 flex space-x-2">
                      <Link
                        href={`/tenants/${tenant._id}`}
                        className="text-blue-600 text-sm hover:underline"
                      >
                        View Details
                      </Link>
                      <button className="text-red-600 text-sm hover:underline">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {tenants.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No tenants found</p>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
```

---

#### 2.2 Create `/audit` Page for Activity

**Create file:** `frontend/src/app/audit/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { auditAPI } from '@/lib/api';
import { Activity, BarChart3 } from 'lucide-react';

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
          setLogs(response.data);
        } else {
          const response = await auditAPI.getMyActivity();
          setLogs(response.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load activity logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
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
            <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
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
                <div key={log._id} className="px-6 py-4 flex items-center space-x-4">
                  <Activity className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {log.userId?.email}
                    </p>
                    <p className="text-sm text-gray-500">
                      {log.action.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="text-right">
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
```

---

#### 2.3 Fix Data Review Page

**Update file:** `frontend/src/app/data/page.tsx`

The data page should:
1. Show all data submissions (manager/admin view)
2. Filter by status (submitted, reviewed, approved, rejected)
3. Allow inline review/approval
4. Show images if available

```typescript
// Add to existing data/page.tsx
// Show review controls for managers
if (user?.role === 'manager' || user?.role === 'admin') {
  return (
    <div className="space-y-4">
      {/* Review buttons */}
      <button
        onClick={() => handleReview(item._id, 'reviewed')}
        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
      >
        Mark as Reviewed
      </button>
      {user?.role === 'admin' && (
        <>
          <button
            onClick={() => handleApprove(item._id)}
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
          >
            Approve
          </button>
          <button
            onClick={() => handleReject(item._id)}
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
          >
            Reject
          </button>
        </>
      )}
    </div>
  );
}
```

---

### ✅ STEP 3: Backend - Seed Test Data

**Create file:** `backend/scripts/seed-data.js`

```javascript
const mongoose = require('mongoose');
const User = require('../models/User');
const Tenant = require('../models/Tenant');
const Data = require('../models/Data');
const AuditLog = require('../models/AuditLog');
const bcrypt = require('bcryptjs');

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/glowing-chainsaw?authSource=admin');

    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Tenant.deleteMany({});
    await Data.deleteMany({});
    await AuditLog.deleteMany({});

    // Create tenants
    console.log('🏢 Creating tenants...');
    const tenants = await Tenant.insertMany([
      {
        name: 'Demo Company',
        kycVerified: true,
        licenseVerified: true,
      },
      {
        name: 'Tech Solutions Ltd',
        kycVerified: true,
        licenseVerified: false,
      },
    ]);

    // Create users
    console.log('👥 Creating users...');
    const owner = await User.create({
      email: 'owner@demo.com',
      password: await bcrypt.hash('password', 10),
      role: 'owner',
      tenantId: tenants[0]._id,
    });

    const admin = await User.create({
      email: 'admin@demo.com',
      password: await bcrypt.hash('password', 10),
      role: 'admin',
      tenantId: tenants[0]._id,
    });

    const manager = await User.create({
      email: 'manager@demo.com',
      password: await bcrypt.hash('password', 10),
      role: 'manager',
      tenantId: tenants[0]._id,
    });

    const engineer = await User.create({
      email: 'engineer@demo.com',
      password: await bcrypt.hash('password', 10),
      role: 'engineer',
      tenantId: tenants[0]._id,
    });

    // Create sample data submissions
    console.log('📊 Creating sample data submissions...');
    await Data.insertMany([
      {
        userId: engineer._id,
        tenantId: tenants[0]._id,
        formData: {
          productName: 'Product A',
          quantity: 100,
          location: 'Warehouse A',
        },
        images: ['https://via.placeholder.com/150'],
        status: 'submitted',
      },
      {
        userId: engineer._id,
        tenantId: tenants[0]._id,
        formData: {
          productName: 'Product B',
          quantity: 50,
          location: 'Warehouse B',
        },
        images: [],
        status: 'reviewed',
      },
      {
        userId: engineer._id,
        tenantId: tenants[0]._id,
        formData: {
          productName: 'Product C',
          quantity: 200,
          location: 'Warehouse C',
        },
        images: [],
        status: 'approved',
      },
    ]);

    // Create audit logs
    console.log('📝 Creating audit logs...');
    await AuditLog.insertMany([
      {
        userId: engineer._id,
        tenantId: tenants[0]._id,
        action: 'SUBMIT_DATA',
      },
      {
        userId: manager._id,
        tenantId: tenants[0]._id,
        action: 'REVIEW_DATA',
      },
      {
        userId: admin._id,
        tenantId: tenants[0]._id,
        action: 'APPROVE_DATA',
      },
    ]);

    console.log('✅ Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seedData();
```

**Run seed:**
```bash
cd backend
node scripts/seed-data.js
```

---

### ✅ STEP 4: Test Full Flow

#### Test Credentials:
- **Owner:** `owner@demo.com` / `password`
- **Admin:** `admin@demo.com` / `password`
- **Manager:** `manager@demo.com` / `password`
- **Engineer:** `engineer@demo.com` / `password`

#### Test Workflow:
1. Login as **Engineer** → `/submit` → Submit data
2. Login as **Manager** → `/data` → See submissions → Click "Review"
3. Login as **Admin** → `/data` → Click "Approve"
4. Login as **Owner** → `/tenants` → See all companies → `/audit` → See all activity

---

## 📝 Summary of Changes Needed

| Component | Issue | Fix |
|-----------|-------|-----|
| **Frontend** | No `/tenants` page | Create new page ✅ |
| **Frontend** | No `/audit` page | Create new page ✅ |
| **Frontend** | `/data` page empty | Wire to API + add review controls |
| **Backend** | No test data | Run seed script ✅ |
| **Backend** | APIs might not populate | Verify queries return data |

---

## 🚀 Next Steps

1. ✅ Create `/audit` and `/tenants` pages (Copy code above)
2. ✅ Update `/data` page with review functionality
3. ✅ Run backend seed script
4. ✅ Rebuild frontend: `docker compose up -d --build frontend`
5. ✅ Test login flow with each role
6. ✅ Verify data flows end-to-end

---
