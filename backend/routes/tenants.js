const express = require('express');
const Tenant = require('../models/Tenant');
const { auth, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

function validateLicenseKey(licenseKey, plan) {
  if (!licenseKey) return false;
  const normalized = String(licenseKey).trim().toUpperCase();
  if (plan === 'free') {
    return normalized.startsWith('FREE-');
  }
  if (plan === 'standard') {
    return normalized.startsWith('STD-');
  }
  if (plan === 'premium') {
    return normalized.startsWith('PRM-');
  }
  return false;
}

function deriveTenantBenefits(plan) {
  if (plan === 'premium') {
    return [
      'Priority support',
      'Advanced analytics',
      'Custom integrations',
    ];
  }
  if (plan === 'standard') {
    return [
      'Standard support',
      'Enhanced reports',
    ];
  }
  return ['Basic support', 'Core platform access'];
}

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
    const { name, plan = 'free', licenseKey } = req.body;

    const licenseIsValid = plan === 'free' || Boolean(licenseKey && validateLicenseKey(licenseKey, plan));
    const licenseVerified = plan === 'free' ? true : licenseIsValid;

    const tenant = new Tenant({
      name,
      plan,
      licenseKey,
      licenseVerified,
      kycVerified: false,
      benefits: deriveTenantBenefits(plan),
      documents: []
    });

    await tenant.save();

    const message = plan === 'free'
      ? 'Tenant created successfully.'
      : licenseIsValid
        ? 'Tenant created successfully. License verified.'
        : 'Tenant created successfully. License is pending verification.';

    res.status(201).json({ message, tenant });
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
    if (req.body.plan) {
      tenant.benefits = deriveTenantBenefits(req.body.plan);
    }
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

    const { licenseKey } = req.body;
    if (tenant.plan === 'free') {
      tenant.licenseVerified = true;
      tenant.licenseKey = licenseKey || tenant.licenseKey;
      await tenant.save();
      return res.json({ message: 'Free plan active, license verification not required', tenant });
    }

    if (!licenseKey || !validateLicenseKey(licenseKey, tenant.plan)) {
      return res.status(400).json({ message: 'Invalid license key for selected plan' });
    }

    tenant.licenseVerified = true;
    tenant.licenseKey = licenseKey;
    await tenant.save();
    res.json({ message: 'License verified', tenant });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;