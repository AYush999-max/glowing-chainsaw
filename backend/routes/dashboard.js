const express = require('express');
const User = require('../models/User');
const Tenant = require('../models/Tenant');
const Data = require('../models/Data');
const AuditLog = require('../models/AuditLog');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get dashboard stats
router.get('/stats', auth, async (req, res) => {
  try {
    let userQuery = {};
    let tenantQuery = {};
    let dataQuery = {};
    let auditQuery = {};

    if (req.user.role !== 'owner') {
      userQuery.tenantId = req.user.tenantId;
      tenantQuery._id = req.user.tenantId;
      dataQuery.tenantId = req.user.tenantId;
      auditQuery.tenantId = req.user.tenantId;
    }

    const [
      totalUsers,
      totalTenants,
      totalData,
      dataByStatus,
      recentActivity
    ] = await Promise.all([
      User.countDocuments(userQuery),
      Tenant.countDocuments(tenantQuery),
      Data.countDocuments(dataQuery),
      Data.aggregate([
        { $match: dataQuery },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      AuditLog.find(auditQuery)
        .populate('userId', 'email')
        .sort({ timestamp: -1 })
        .limit(10)
    ]);

    res.json({
      totalUsers,
      totalTenants,
      totalData,
      dataByStatus: dataByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      recentActivity
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get data analytics
router.get('/analytics', auth, authorize('owner', 'admin', 'manager'), async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'owner') {
      query.tenantId = req.user.tenantId;
    }

    const analytics = await Data.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            status: '$status',
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;