const { validationResult, body, param, query } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Export validation methods and the validate middleware
validate.body = body;
validate.param = param;
validate.query = query;

module.exports = validate;
