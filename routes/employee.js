const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getProductBySku, createInvoice } = require('../controllers/employeeController');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/products/sku/:sku', authenticate, authorize('employee'), getProductBySku);

router.post('/invoices',
  authenticate,
  authorize('employee'),
  body('tenantId').notEmpty(),
  body('customer.name').notEmpty(),
  body('items').isArray({ min: 1 }),
  validate,
  createInvoice
);

module.exports = router;
