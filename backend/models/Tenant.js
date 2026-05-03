const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  plan: { type: String, enum: ['free', 'standard', 'premium'], default: 'free' },
  licenseKey: { type: String },
  kycVerified: { type: Boolean, default: false },
  licenseVerified: { type: Boolean, default: false },
  benefits: [{ type: String }],
  documents: [{ type: String }], // URLs or paths to documents
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tenant', tenantSchema);