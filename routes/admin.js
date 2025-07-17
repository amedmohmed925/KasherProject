const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { addProduct, updateProduct, deleteProduct, listInvoices, generateReport } = require('../controllers/adminController');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

const router = express.Router();

router.post('/products',
  authenticate,
  authorize('admin'),
  body('tenantId').notEmpty(),
  body('name').notEmpty(),
  body('sku').notEmpty(),
  body('originalPrice').isNumeric(),
  body('sellingPrice').isNumeric(),
  body('quantity').isNumeric(),
  validate,
  addProduct
);

router.put('/products/:id', authenticate, authorize('admin'), updateProduct);
router.delete('/products/:id', authenticate, authorize('admin'), deleteProduct);
router.get('/invoices', authenticate, authorize('admin'), listInvoices);
router.get('/reports', authenticate, authorize('admin'), generateReport);

module.exports = router;
