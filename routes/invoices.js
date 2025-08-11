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

// Add a new invoice (aligned with controller expecting items[] & customer object)
router.post('/add-invoices',
  ...adminMiddleware,
  [
    body('items').isArray({ min: 1 }).withMessage('items must be a non-empty array'),
    body('items.*.productId').notEmpty().withMessage('productId is required for each item'),
    body('items.*.quantity').isInt({ gt: 0 }).withMessage('quantity must be a positive integer'),
    body('customer').isObject().withMessage('customer object is required'),
    body('customer.name').notEmpty().withMessage('customer name is required'),
    body('discount').optional().isObject(),
    body('discount.type').optional().isIn(['percentage', 'fixed']).withMessage('discount.type must be percentage or fixed'),
    body('discount.value').optional().isFloat({ min: 0 }).withMessage('discount.value must be >= 0'),
    body('paymentMethod').optional().isIn(['cash','card','bank_transfer','other']).withMessage('Invalid payment method')
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
