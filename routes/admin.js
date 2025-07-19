const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const addProduct = require('../controllers/admin/products/addProductController');
const getProducts = require('../controllers/admin/products/getProductsController');
const deleteProduct = require('../controllers/admin/products/deleteProductController');
const updateProduct = require('../controllers/admin/products/updateProductController');
const generateReport = require('../controllers/admin/generateReportController');
const listInvoices = require('../controllers/admin/listInvoicesController');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const addCategoryController = require('../controllers/admin/categories/addCategoryController');
const getCategoriesController = require('../controllers/admin/categories/getCategoriesController');
const deleteCategoryController = require('../controllers/admin/categories/deleteCategoryController');
const updateCategoryController = require('../controllers/admin/categories/updateCategoryController');
const getAllInvoicesController = require('../controllers/admin/invoices/getAllInvoicesController');
const getAdminStatsController = require('../controllers/admin/getAdminStatsController');

const router = express.Router();

// Get all categories
router.get('/categories', authenticate, authorize('admin'), getCategoriesController);

// Admin stats: invoices count, daily/monthly/yearly profits
router.get('/stats', authenticate, authorize('admin'), getAdminStatsController);

// Add category
router.post('/categories',
  authenticate,
  authorize('admin'),
  body('name').notEmpty(),
  validate,
  addCategoryController
);

// Get all invoices with full details
router.get('/all-invoices', authenticate, authorize('admin'), getAllInvoicesController);

// Update category
router.put('/categories/:id',
  authenticate,
  authorize('admin'),
  body('name').notEmpty(),
  validate,
  updateCategoryController
);

// Delete category
router.delete('/categories/:id', authenticate, authorize('admin'), deleteCategoryController);

// Get all products
router.get('/products', authenticate, authorize('admin'), getProducts);

// Add product
router.post('/products',
  authenticate,
  authorize('admin'),
  body('name').notEmpty(),
  body('sku').notEmpty(),
  body('originalPrice').isNumeric(),
  body('sellingPrice').isNumeric(),
  body('quantity').isInt({ min: 0 }),
  body('categoryId').notEmpty(),
  validate,
  addProduct
);

// Update product
router.put('/products/:id',
  authenticate,
  authorize('admin'),
  body('name').notEmpty(),
  body('sku').notEmpty(),
  body('originalPrice').isNumeric(),
  body('sellingPrice').isNumeric(),
  body('quantity').isInt({ min: 0 }),
  body('categoryId').notEmpty(),
  validate,
  updateProduct
);

// Delete product
router.delete('/products/:id', authenticate, authorize('admin'), deleteProduct);

// فواتير البيع وإدارتها للأدمن فقط
router.get('/invoices', authenticate, authorize('admin'), listInvoices);
router.get('/reports', authenticate, authorize('admin'), generateReport);

module.exports = router;
