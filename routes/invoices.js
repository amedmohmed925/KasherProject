const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const addInvoiceController = require('../controllers/admin/invoices/addInvoiceController');
const searchInvoicesController = require('../controllers/admin/invoices/searchInvoicesController');
const getAllInvoicesController = require('../controllers/admin/invoices/getAllInvoicesController');
const getInvoiceProfitController = require('../controllers/admin/invoices/getInvoiceProfitController');
const getAllProfitsController = require('../controllers/admin/invoices/getAllProfitsController');

const router = express.Router();

// Add a new invoice
router.post('/add-invoices',
  authenticate,
  authorize('admin'),
  [
    body('products').isArray().withMessage('Products must be an array'),
    body('products.*.sku').notEmpty().withMessage('SKU is required'),
    body('products.*.quantity').isNumeric().withMessage('Quantity must be a number'),
    body('customerName').optional().isString()
  ],
  validate,
  addInvoiceController
);

// Search and filter invoices
router.get('/search',
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

// Get all invoices
router.get('/',
  authenticate,
  authorize('admin'),
  getAllInvoicesController
);
// Get profit for a specific invoice
router.get('/:id/profit',
  authenticate,
  authorize('admin'),
  getInvoiceProfitController
);

// Get all profits
router.get('/profits',
  authenticate,
  authorize('admin'),
  getAllProfitsController
);

module.exports = router;
