# Glowing Chainsaw - Multi-Tenant Digital Platform

A comprehensive multi-tenant digital platform for data management and operational workflows with role-based access control.

## 🚀 Quick Start with Docker (Recommended)

The easiest way to run the complete platform is using Docker:

```bash
# Clone the repository
git clone <repository-url>
cd glowing-chainsaw

# Run the complete setup
./run-all.sh
```

This will:
- ✅ Build all Docker images
- ✅ Start MongoDB, Backend API, and Frontend
- ✅ Initialize database with sample data
- ✅ Provide access to the full application

### Sample Account
- **Email**: owner@demo.com
- **Password**: password123
- **Role**: Owner (full access)

## 🐳 Manual Docker Setup

If you prefer to run Docker commands manually:

```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build

# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## 🚀 Manual Development Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or cloud)
- npm or yarn

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env  # Configure your environment variables
npm run dev
```

**Environment Variables:**
```env
MONGODB_URI=mongodb://localhost:27017/glowing-chainsaw
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 3. Access the Application

- **Web Dashboard**: http://localhost:3000
- **Mobile PWA**: http://localhost:3000 (responsive design)
- **API Documentation**: http://localhost:5000/api

## 📱 Mobile PWA Installation

1. Open the app in a mobile browser
2. Tap "Add to Home Screen"
3. Launch from home screen for full PWA experience

## 🔐 Default Users

After setup, create initial users:

1. **Owner**: Full platform administrator
2. **Admin**: Company administrator
3. **Manager**: Data reviewer
4. **Engineer**: Field data collector

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration (admin only)
- `GET /api/auth/profile` - Get user profile

### User Management
- `GET /api/users/:tenantId` - List users by tenant
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Data Management
- `POST /api/data` - Submit data with images
- `GET /api/data/:tenantId` - Get tenant data
- `PUT /api/data/:id/review` - Review data
- `PUT /api/data/:id/approve` - Approve data

### Dashboard & Analytics
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/analytics` - Data analytics

### Audit & Security
- `GET /api/audit` - Audit logs
- `GET /api/audit/my-activity` - User activity

## 🔒 Security Features

- JWT token authentication
- Role-based permissions
- Input validation with Joi
- Rate limiting and CORS protection
- Helmet security headers
- Audit logging

## 📱 PWA Features

- **Offline Support**: Cache static assets and API responses
- **Background Sync**: Queue requests when offline
- **Camera Integration**: Capture photos directly in app
- **Responsive Design**: Optimized for all screen sizes
- **App-like Experience**: Installable on mobile devices

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend build test
cd frontend
npm run build
```

## 📦 Deployment

### Docker Deployment
```bash
# Production deployment
docker-compose -f docker-compose.yml up -d

# With custom environment
docker-compose --env-file .env.prod up -d
```

### Manual Deployment
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions, please contact the development team.

See [requirements.md](requirements.md) for detailed project specifications.

## Credits

- **Data Lead:** Ayush
- **Concept/Idea:** Basak