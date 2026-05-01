const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
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

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/glowing-chainsaw', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Glowing Chainsaw Backend API' });
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});