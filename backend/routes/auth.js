const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// Register (only admins and owners can create users)
router.post('/register', auth, authorize('owner', 'admin'), validate(schemas.user), async (req, res) => {
  try {
    const { email, password, role, tenantId } = req.body;

    // Validate role hierarchy
    if (req.user.role === 'admin' && (role === 'owner' || role === 'admin')) {
      return res.status(403).json({ message: 'Admins cannot create owners or other admins' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, role, tenantId });
    await user.save();
    res.status(201).json({ message: 'User registered', user: { id: user._id, email, role, tenantId } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', validate(schemas.login), async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, role: user.role, tenantId: user.tenantId }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user._id, email, role: user.role, tenantId: user.tenantId } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('tenantId');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;