const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const serverless = require('serverless-http');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// MongoDB connection cache for serverless
let mongoConnected = false;

async function connectMongoDB() {
  if (mongoConnected) {
    return;
  }
  
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    mongoConnected = true;
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err;
  }
}

// Connect to MongoDB before handling routes
connectMongoDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err.message);
});

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Glowing Chainsaw Backend API' });
});

// Health check endpoint (no DB required)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', mongodb: mongoConnected });
});

// Auth routes placeholder
app.use('/api/auth', require('./routes/auth'));

// Tenant routes placeholder
app.use('/api/tenants', require('./routes/tenants'));

// User routes placeholder
app.use('/api/users', require('./routes/users'));

// Data routes placeholder
app.use('/api/data', require('./routes/data'));

// Audit routes
app.use('/api/audit', require('./routes/audit'));

// Dashboard routes
app.use('/api/dashboard', require('./routes/dashboard'));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString(),
  });
});


const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = serverless(app);
