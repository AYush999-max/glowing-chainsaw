const express = require('express');
const AuditLog = require('../models/AuditLog');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get audit logs (admins and owners only)
router.get('/', auth, authorize('owner', 'admin'), async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'admin') {
      query.tenantId = req.user.tenantId;
    }

    const { page = 1, limit = 50, action, resource, userId } = req.query;

    if (action) query.action = action;
    if (resource) query.resource = resource;
    if (userId) query.userId = userId;

    const logs = await AuditLog.find(query)
      .populate('userId', 'email')
      .populate('tenantId', 'name')
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AuditLog.countDocuments(query);

    res.json({
      logs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get audit logs for current user
router.get('/my-activity', auth, async (req, res) => {
  try {
    const logs = await AuditLog.find({ userId: req.user.id })
      .sort({ timestamp: -1 })
      .limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;