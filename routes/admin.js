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

// Get all categories
router.get('/categories', authenticate, authorize('admin'), getCategoriesController);

// Add category
router.post('/categories',
  authenticate,
  authorize('admin'),
  body('name').notEmpty(),
  validate,
  addCategoryController
);

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

module.exports = router;
