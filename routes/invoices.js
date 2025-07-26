const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const checkSubscription = require('../middleware/checkSubscription');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const addInvoiceController = require('../controllers/admin/invoices/addInvoiceController');
const searchInvoicesController = require('../controllers/admin/invoices/searchInvoicesController');
const getAllInvoicesController = require('../controllers/admin/invoices/getAllInvoicesController');
const getInvoiceProfitController = require('../controllers/admin/invoices/getInvoiceProfitController');
const getAllProfitsController = require('../controllers/admin/invoices/getAllProfitsController');

const router = express.Router();

// Middleware مشترك للفواتير
const adminMiddleware = [authenticate, authorize('admin'), checkSubscription];

// Add a new invoice
router.post('/add-invoices',
  ...adminMiddleware,
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
  ...adminMiddleware,
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
  ...adminMiddleware,
  getAllInvoicesController
);

// Get profit for a specific invoice
router.get('/profit/:id',
  ...adminMiddleware,
  getInvoiceProfitController
);

// Get all profits
router.get('/profits',
  ...adminMiddleware,
  getAllProfitsController
);

module.exports = router;
