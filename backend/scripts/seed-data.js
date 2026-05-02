const mongoose = require('mongoose');
const User = require('../models/User');
const Tenant = require('../models/Tenant');
const Data = require('../models/Data');
const AuditLog = require('../models/AuditLog');
const bcrypt = require('bcryptjs');

async function seedData() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password123@mongodb:27017/glowing-chainsaw?authSource=admin';
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);

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
        documents: [],
      },
      {
        name: 'Tech Solutions Ltd',
        kycVerified: true,
        licenseVerified: false,
        documents: [],
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

    const engineer1 = await User.create({
      email: 'engineer1@demo.com',
      password: await bcrypt.hash('password', 10),
      role: 'engineer',
      tenantId: tenants[0]._id,
    });

    const engineer2 = await User.create({
      email: 'engineer2@demo.com',
      password: await bcrypt.hash('password', 10),
      role: 'engineer',
      tenantId: tenants[0]._id,
    });

    // Create sample data submissions
    console.log('📊 Creating sample data submissions...');
    const data = await Data.insertMany([
      {
        userId: engineer1._id,
        tenantId: tenants[0]._id,
        formData: {
          productName: 'Product A - Ayush Dataset',
          quantity: 100,
          location: 'Warehouse A',
          category: 'Electronics',
          quality: 'High',
        },
        images: ['image1.jpg', 'image2.jpg'],
        status: 'submitted',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        userId: engineer1._id,
        tenantId: tenants[0]._id,
        formData: {
          productName: 'Product B - Ayush Dataset',
          quantity: 50,
          location: 'Warehouse B',
          category: 'Chemicals',
          quality: 'Medium',
        },
        images: [],
        status: 'reviewed',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        userId: engineer2._id,
        tenantId: tenants[0]._id,
        formData: {
          productName: 'Product C - Ayush Dataset',
          quantity: 200,
          location: 'Warehouse C',
          category: 'Pharmaceuticals',
          quality: 'High',
        },
        images: ['image3.jpg'],
        status: 'approved',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        userId: engineer2._id,
        tenantId: tenants[0]._id,
        formData: {
          productName: 'Product D - Ayush Dataset',
          quantity: 75,
          location: 'Warehouse A',
          category: 'Herbal',
          quality: 'High',
        },
        images: [],
        status: 'submitted',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      },
    ]);

    // Create audit logs
    console.log('📝 Creating audit logs...');
    await AuditLog.insertMany([
      {
        userId: engineer1._id,
        tenantId: tenants[0]._id,
        action: 'SUBMIT_DATA',
        resource: 'Data',
        resourceId: data[0]._id,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        userId: engineer1._id,
        tenantId: tenants[0]._id,
        action: 'SUBMIT_DATA',
        resource: 'Data',
        resourceId: data[1]._id,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        userId: manager._id,
        tenantId: tenants[0]._id,
        action: 'REVIEW_DATA',
        resource: 'Data',
        resourceId: data[1]._id,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        userId: admin._id,
        tenantId: tenants[0]._id,
        action: 'APPROVE_DATA',
        resource: 'Data',
        resourceId: data[2]._id,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        userId: engineer2._id,
        tenantId: tenants[0]._id,
        action: 'SUBMIT_DATA',
        resource: 'Data',
        resourceId: data[3]._id,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
      {
        userId: owner._id,
        tenantId: tenants[0]._id,
        action: 'VIEW_TENANTS',
        resource: 'Tenant',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
    ]);

    console.log('✅ Seed completed successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('  Owner:    owner@demo.com / password');
    console.log('  Admin:    admin@demo.com / password');
    console.log('  Manager:  manager@demo.com / password');
    console.log('  Engineer: engineer1@demo.com / password');
    console.log('  Engineer: engineer2@demo.com / password');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seedData();
