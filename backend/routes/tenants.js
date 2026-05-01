const express = require('express');
const Tenant = require('../models/Tenant');
const { auth, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// Get all tenants (owner only)
router.get('/', auth, authorize('owner'), async (req, res) => {
  try {
    const tenants = await Tenant.find();
    res.json(tenants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get tenant by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    // Check permissions
    if (req.user.role !== 'owner' && tenant._id.toString() !== req.user.tenantId.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(tenant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create tenant (owner only)
router.post('/', auth, authorize('owner'), validate(schemas.tenant), async (req, res) => {
  try {
    const tenant = new Tenant(req.body);
    await tenant.save();
    res.status(201).json(tenant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update tenant
router.put('/:id', auth, authorize('owner'), async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    Object.assign(tenant, req.body);
    await tenant.save();
    res.json(tenant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// KYC verification (owner only)
router.post('/:id/verify-kyc', auth, authorize('owner'), async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    tenant.kycVerified = true;
    await tenant.save();
    res.json({ message: 'KYC verified', tenant });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// License verification (owner only)
router.post('/:id/verify-license', auth, authorize('owner'), async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    tenant.licenseVerified = true;
    await tenant.save();
    res.json({ message: 'License verified', tenant });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;