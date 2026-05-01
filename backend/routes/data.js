const express = require('express');
const multer = require('multer');
const Data = require('../models/Data');
const { auth, authorize } = require('../middleware/auth');
const auditLog = require('../middleware/audit');

const router = express.Router();

// Multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Submit data (engineers only, for their tenant)
router.post('/', auth, authorize('engineer'), auditLog('SUBMIT_DATA', 'Data'), upload.array('images'), async (req, res) => {
  try {
    const { formData } = req.body;
    const images = req.files ? req.files.map(file => file.path) : [];

    const data = new Data({
      formData: JSON.parse(formData),
      images,
      tenantId: req.user.tenantId,
      userId: req.user.id
    });
    await data.save();
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get data for tenant (managers and admins can see their tenant data)
router.get('/:tenantId', auth, async (req, res) => {
  try {
    if (req.user.role === 'engineer') {
      return res.status(403).json({ message: 'Engineers cannot view data' });
    }

    let query = { tenantId: req.params.tenantId };
    if (req.user.role !== 'owner') {
      query.tenantId = req.user.tenantId;
    }

    const data = await Data.find(query).populate('userId', 'email').sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get my submissions (engineers only)
router.get('/my/submissions', auth, authorize('engineer'), async (req, res) => {
  try {
    const data = await Data.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Review data (managers only)
router.put('/:id/review', auth, authorize('manager'), auditLog('REVIEW_DATA', 'Data'), async (req, res) => {
  try {
    const { status, comments } = req.body;
    const data = await Data.findById(req.params.id);

    if (!data) return res.status(404).json({ message: 'Data not found' });
    if (data.tenantId.toString() !== req.user.tenantId.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    data.status = status;
    data.reviewComments = comments;
    data.reviewedBy = req.user.id;
    data.reviewedAt = new Date();
    await data.save();

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve data (admins only)
router.put('/:id/approve', auth, authorize('admin'), auditLog('APPROVE_DATA', 'Data'), async (req, res) => {
  try {
    const data = await Data.findById(req.params.id);
    if (!data) return res.status(404).json({ message: 'Data not found' });
    if (data.tenantId.toString() !== req.user.tenantId.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    data.status = 'approved';
    data.approvedBy = req.user.id;
    data.approvedAt = new Date();
    await data.save();

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;