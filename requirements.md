## 📄 Project Requirement Document

### 1. Project Overview

We are building a **multi-tenant digital platform** available as:

* Mobile App
* Web Application
* Progressive Web App (PWA)

The platform will manage **company data, product metadata, and operational workflows** with role-based access.

---

### 2. Core Concept

* Each **company = tenant**
* Platform supports **multiple tenants (multi-tenant architecture)**
* Centralized control with hierarchical user roles

---

### 3. User Roles & Access Control

#### 🔐 Role Hierarchy:

1. **Owner (Super Admin)**

   * Full platform access
   * Controls all tenants and system settings

2. **Admin**

   * Manages a specific company (tenant)
   * Controls users within the tenant

3. **Manager**

   * Supervises operations
   * Reviews submissions and reports

4. **Engineer**

   * Uses the mobile app
   * Submits data, forms, and images

---

### 4. Platform Modules

#### 📱 App (Engineer-Focused)

* Login & authentication
* Form submission with validation
* Capture & upload photographs
* Offline capability (PWA support)
* Sync data to backend

#### 🌐 Web Panel

* Admin & Manager dashboard
* Data visualization & reporting
* User management
* Tenant/company management

#### ⚙️ Backend System

* API-based architecture
* Multi-tenant data separation
* Secure authentication & authorization
* Scalable database design

---

### 5. Data Management

#### 📊 Data Types:

* Product metadata (list of products)
* Company metadata
* Operational data submitted by engineers
* Image/photo storage in database/cloud

#### 🧩 Special Inputs:

* AYUSH data (domain-specific dataset)
* Structured + unstructured data handling

---

### 6. Workflow

1. Engineer submits:

   * Forms (validated)
   * Photos

2. Data flows to:

   * Admin → Manager (review hierarchy)

3. Manager:

   * Approves / reviews / analyzes data

---

### 7. KYC & Licensing Module

* Company onboarding requires:

  * KYC verification
  * Licensing validation
* Secure document upload & storage
* Approval workflow

---

### 8. Features

* Multi-tenant architecture
* Role-based access control (RBAC)
* Form validation system
* Image capture & storage
* Metadata management
* Audit logs & activity tracking
* Offline-first support (PWA)

---

### 9. Platform Tier

#### 💎 Platinum Tier

* Full access to all features
* No restrictions
* Advanced analytics & controls

---

### 10. Technical Expectations

* Scalable cloud infrastructure
* Secure APIs
* Database with tenant isolation
* Responsive UI (mobile + web)
* High availability & performance

---

### 11. Ownership & Credits

* **Data Lead:** Ayush
* **Concept/Idea:** Basak

---