const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  kycVerified: { type: Boolean, default: false },
  licenseVerified: { type: Boolean, default: false },
  documents: [{ type: String }], // URLs or paths to documents
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tenant', tenantSchema);