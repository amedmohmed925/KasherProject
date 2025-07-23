const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const addInvoiceController = require('../controllers/admin/invoices/addInvoiceController');
const searchInvoicesController = require('../controllers/admin/invoices/searchInvoicesController');

const router = express.Router();

// Add a new invoice
router.post('/invoices',
  authenticate,
  authorize('admin'),
  [
    body('products').isArray().withMessage('Products must be an array'),
    body('products.*.productId').notEmpty().withMessage('Product ID is required'),
    body('products.*.quantity').isNumeric().withMessage('Quantity must be a number'),
    body('customerName').optional().isString(),
    body('totalPrice').isNumeric().withMessage('Total price must be a number')
  ],
  validate,
  addInvoiceController
);

// Search and filter invoices
router.get('/invoices/search',
  authenticate,
  authorize('admin'),
  [
    body('customerName').optional().isString(),
    body('price').optional().isNumeric(),
    body('date').optional().isISO8601().toDate()
  ],
  validate,
  searchInvoicesController
);

module.exports = router;
