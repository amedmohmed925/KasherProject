const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const checkSubscription = require('../middleware/checkSubscription');
const { query, body } = require('express-validator');
const validate = require('../middleware/validate');
const searchProductsController = require('../controllers/admin/products/searchProductsController');
const getProductsController = require('../controllers/admin/products/getProductsController');
const addProductController = require('../controllers/admin/products/addProductController');
const updateProductController = require('../controllers/admin/products/updateProductController');
const deleteProductController = require('../controllers/admin/products/deleteProductController');
const inventoryStatsController = require('../controllers/admin/inventory/inventoryStatsController');
const inventoryReportController = require('../controllers/admin/inventory/inventoryReportController');
const lowStockController = require('../controllers/admin/inventory/lowStockController');

const router = express.Router();

// Middleware مشترك للمخزون
const adminMiddleware = [authenticate, authorize('admin'), checkSubscription];

// Get all products
router.get('/products',
  ...adminMiddleware,
  getProductsController
);

// Add new product
router.post('/products',
  ...adminMiddleware,
  [
    body('name').notEmpty().withMessage('Product name is required'),
    body('sku').notEmpty().withMessage('SKU is required'),
    body('originalPrice').isFloat({ min: 0 }).withMessage('Original price must be a positive number'),
    body('sellingPrice').isFloat({ min: 0 }).withMessage('Selling price must be a positive number'),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
    body('category').optional().isString()
  ],
  validate,
  addProductController
);

// Update product
router.put('/products/:id',
  ...adminMiddleware,
  [
    body('name').optional().notEmpty().withMessage('Product name cannot be empty'),
    body('sku').optional().notEmpty().withMessage('SKU cannot be empty'),
    body('originalPrice').optional().isFloat({ min: 0 }).withMessage('Original price must be a positive number'),
    body('sellingPrice').optional().isFloat({ min: 0 }).withMessage('Selling price must be a positive number'),
    body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
    body('category').optional().isString()
  ],
  validate,
  updateProductController
);

// Delete product
router.delete('/products/:id',
  ...adminMiddleware,
  deleteProductController
);

// Search and filter products
router.get('/products/search',
  ...adminMiddleware,
  [
    query('name').optional().isString(),
    query('category').optional().isString(),
    query('profit').optional().isNumeric(),
    query('quantity').optional().isNumeric(),
    query('price').optional().isNumeric()
  ],
  validate,
  searchProductsController
);

// Get inventory statistics
router.get('/stats',
  ...adminMiddleware,
  inventoryStatsController
);

// Get inventory report
router.get('/report',
  ...adminMiddleware,
  [
    query('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
    query('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
    query('category').optional().isString()
  ],
  validate,
  inventoryReportController
);

// Get low stock products
router.get('/low-stock',
  ...adminMiddleware,
  [
    query('threshold').optional().isInt({ min: 1 }).withMessage('Threshold must be a positive integer')
  ],
  validate,
  lowStockController
);

module.exports = router;
