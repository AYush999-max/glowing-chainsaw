const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // e.g., 'CREATE_USER', 'SUBMIT_DATA', 'REVIEW_DATA'
  resource: { type: String, required: true }, // e.g., 'User', 'Data', 'Tenant'
  resourceId: { type: mongoose.Schema.Types.ObjectId },
  details: { type: mongoose.Schema.Types.Mixed },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
  ipAddress: { type: String },
  userAgent: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);