const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

// Validation schemas
const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('owner', 'admin', 'manager', 'engineer').required(),
  tenantId: Joi.string().required()
});

const tenantSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  plan: Joi.string().valid('free', 'standard', 'premium'),
  licenseKey: Joi.string().allow('', null),
  kycVerified: Joi.boolean(),
  licenseVerified: Joi.boolean(),
  documents: Joi.array().items(Joi.string())
});

const dataSchema = Joi.object({
  formData: Joi.object().required(),
  status: Joi.string().valid('submitted', 'reviewed', 'approved', 'rejected'),
  reviewComments: Joi.string()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

module.exports = {
  validate,
  schemas: {
    user: userSchema,
    tenant: tenantSchema,
    data: dataSchema,
    login: loginSchema
  }
};