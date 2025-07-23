const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { query } = require('express-validator');
const validate = require('../middleware/validate');
const searchProductsController = require('../controllers/admin/products/searchProductsController');

const router = express.Router();

// Search and filter products
router.get('/products/search',
  authenticate,
  authorize('admin'),
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

module.exports = router;
