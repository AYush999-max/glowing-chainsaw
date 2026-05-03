const express = require('express');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get users for a tenant (admins can see their tenant, owners can see all)
router.get('/:tenantId', auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'admin' || req.user.role === 'manager') {
      query = { tenantId: req.user.tenantId };
    } else if (req.user.role === 'owner') {
      query = { tenantId: req.params.tenantId };
    } else {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create user (only admins and owners)
router.post('/', auth, authorize('owner', 'admin'), async (req, res) => {
  try {
    const { email, password, role, tenantId } = req.body;

    // Validate permissions
    if (req.user.role === 'admin' && tenantId !== req.user.tenantId) {
      return res.status(403).json({ message: 'Admins can only create users in their tenant' });
    }

    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user
router.put('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check permissions
    if (req.user.role === 'admin' && user.tenantId.toString() !== req.user.tenantId.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    Object.assign(user, req.body);
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user
router.delete('/:id', auth, authorize('owner', 'admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'owner' && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Only owners can delete owner accounts' });
    }

    if (req.user.role === 'admin' && user.tenantId.toString() !== req.user.tenantId.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;