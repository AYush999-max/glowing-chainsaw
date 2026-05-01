const AuditLog = require('../models/AuditLog');

const auditLog = (action, resource) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    res.send = function(data) {
      // Log successful operations
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        const logEntry = new AuditLog({
          userId: req.user.id,
          action,
          resource,
          resourceId: req.params.id || req.body.id,
          details: {
            method: req.method,
            url: req.url,
            body: req.method !== 'GET' ? req.body : undefined,
            response: res.statusCode
          },
          tenantId: req.user.tenantId,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        });
        logEntry.save().catch(err => console.error('Audit log error:', err));
      }
      originalSend.call(this, data);
    };
    next();
  };
};

module.exports = auditLog;