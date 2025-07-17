const getInvoiceProfitController = require('../controllers/admin/invoices/getInvoiceProfitController');
// Get profit (original vs selling price) for a specific invoice
const getEmployeesController = require('../controllers/admin/employees/getEmployeesController');
const deleteEmployeeController = require('../controllers/admin/employees/deleteEmployeeController');

const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const  addProduct  = require('../controllers/admin/products/addProductController');
const  getProducts  = require('../controllers/admin/products/getProductsController');
const  deleteProduct  = require('../controllers/admin/products/deleteProductController');
const  updateProduct  = require('../controllers/admin/products/updateProductController');
const  generateReport  = require('../controllers/admin/generateReportController');
const  listInvoices  = require('../controllers/admin/listInvoicesController');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

const router = express.Router();


const addCategoryController = require('../controllers/admin/categories/addCategoryController');
const getCategoriesController = require('../controllers/admin/categories/getCategoriesController');
const deleteCategoryController = require('../controllers/admin/categories/deleteCategoryController');
const updateCategoryController = require('../controllers/admin/categories/updateCategoryController');
const getAllInvoicesController = require('../controllers/admin/invoices/getAllInvoicesController');
const getAdminStatsController = require('../controllers/admin/getAdminStatsController');

// Get all categories
router.get('/categories', authenticate, authorize('admin'), getCategoriesController);

// Admin stats: employees count, invoices count, daily/monthly/yearly profits
router.get('/stats', authenticate, authorize('admin'), getAdminStatsController);
// Get all invoices with full details
// Add category
router.post('/categories',
  authenticate,
  authorize('admin'),
  body('name').notEmpty(),
  validate,
  addCategoryController
);

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
router.get('/invoices', authenticate, authorize('admin'), listInvoices);
router.get('/reports', authenticate, authorize('admin'), generateReport);
router.get('/employees', authenticate, authorize('admin'), getEmployeesController);
router.delete('/employees/:id', authenticate, authorize('admin'), deleteEmployeeController);
router.get('/invoices/:id/profit', authenticate, authorize('admin'), getInvoiceProfitController);

module.exports = router;
