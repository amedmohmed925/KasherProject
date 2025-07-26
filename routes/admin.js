const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const checkSubscription = require('../middleware/checkSubscription');
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
const analyticsController = require('../controllers/admin/dashboard/analyticsController');
const searchProductsController = require('../controllers/admin/products/searchProductsController');
const getAdminByIdController = require('../controllers/admin/getAdminByIdController');

const router = express.Router();

// Middleware مشترك لجميع routes الأدمن (authentication + subscription check)
const adminMiddleware = [authenticate, authorize('admin'), checkSubscription];
const adminSuperAdminMiddleware = [authenticate, authorize('admin', 'superAdmin')];

// Get all categories
router.get('/categories', ...adminMiddleware, getCategoriesController);

// Add category
router.post('/categories',
  ...adminSuperAdminMiddleware,
  body('name').notEmpty(),
  validate,
  addCategoryController
);

// Admin stats: invoices count, daily/monthly/yearly profits
router.get('/stats', ...adminMiddleware, getAdminStatsController);

// Get all invoices with full details
router.get('/all-invoices', ...adminMiddleware, getAllInvoicesController);

// Update category
router.put('/categories/:id',
  ...adminMiddleware,
  body('name').notEmpty(),
  validate,
  updateCategoryController
);

// Delete category
router.delete('/categories/:id', ...adminMiddleware, deleteCategoryController);

// Get all products
router.get('/products', ...adminMiddleware, getProducts);

// Add product
router.post('/products',
  ...adminMiddleware,
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
  ...adminMiddleware,
  body('name').notEmpty(),
  body('sku').notEmpty(),
  body('originalPrice').isNumeric(),
  body('sellingPrice').isNumeric(),
  body('quantity').isInt({ min: 0 }),
  body('categoryId').notEmpty(),
  validate,
  updateProduct
);

// Search products
router.get('/products/search', ...adminMiddleware, searchProductsController);
// Delete product
router.delete('/products/:id', ...adminMiddleware, deleteProduct);

// فواتير البيع وإدارتها للأدمن فقط
router.get('/invoices', ...adminMiddleware, listInvoices);
router.get('/reports', ...adminMiddleware, generateReport);

// Dashboard Analytics
router.get('/dashboard/analytics', ...adminMiddleware, analyticsController);

// Get admin by ID
router.get('/admin/:id', ...adminSuperAdminMiddleware, getAdminByIdController);


module.exports = router;
