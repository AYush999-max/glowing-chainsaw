// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

// Switch to the glowing-chainsaw database
db = db.getSiblingDB('glowing-chainsaw');

// Create collections
db.createCollection('users');
db.createCollection('tenants');
db.createCollection('data');
db.createCollection('auditlogs');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "tenantId": 1 });
db.users.createIndex({ "role": 1 });

db.tenants.createIndex({ "name": 1 }, { unique: true });

db.data.createIndex({ "tenantId": 1 });
db.data.createIndex({ "userId": 1 });
db.data.createIndex({ "status": 1 });
db.data.createIndex({ "createdAt": -1 });

db.auditlogs.createIndex({ "userId": 1 });
db.auditlogs.createIndex({ "tenantId": 1 });
db.auditlogs.createIndex({ "action": 1 });
db.auditlogs.createIndex({ "timestamp": -1 });

// Insert sample tenant
db.tenants.insertOne({
  name: "Demo Company",
  kycVerified: true,
  licenseVerified: true,
  documents: [],
  createdAt: new Date()
});

// Insert sample owner user
db.users.insertOne({
  email: "owner@demo.com",
  password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password: "password"
  role: "owner",
  tenantId: db.tenants.findOne()._id,
  createdAt: new Date()
});

print("Database initialized with sample data!");
print("Sample owner account: owner@demo.com / password");