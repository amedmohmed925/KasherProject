const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const checkSubscription = require('../middleware/checkSubscription');
const { query, body } = require('express-validator');
const validate = require('../middleware/validate');
const searchProductsController = require('../controllers/admin/products/searchProductsController');
const getProductsController = require('../controllers/admin/products/getProductsController');
const addProductController = require('../controllers/admin/products/addProductController');
const updateProductController = require('../controllers/admin/products/updateProductController');
const updateProductImageController = require('../controllers/admin/products/updateProductImageController');
const deleteProductController = require('../controllers/admin/products/deleteProductController');
const inventoryStatsController = require('../controllers/admin/inventory/inventoryStatsController');
const inventoryReportController = require('../controllers/admin/inventory/inventoryReportController');
const lowStockController = require('../controllers/admin/inventory/lowStockController');

// Multer configuration for file uploads (memory storage for Vercel)
const multer = require('multer');
const upload = multer({ 
  storage: multer.memoryStorage(), // Use memory storage instead of disk
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('يجب أن يكون الملف صورة فقط'), false);
    }
  }
});

const router = express.Router();

// Middleware مشترك للمخزون
const adminMiddleware = [authenticate, authorize('admin'), checkSubscription];

// Get all products
router.get('/products',
  ...adminMiddleware,
  getProductsController
);

// Add new product with image upload
router.post('/products',
  ...adminMiddleware,
  upload.single('image'),
  [
    body('name').notEmpty().withMessage('اسم المنتج مطلوب'),
    body('sku').notEmpty().withMessage('رمز المنتج مطلوب'),
    body('originalPrice').isFloat({ min: 0 }).withMessage('السعر الأصلي يجب أن يكون رقم موجب'),
    body('sellingPrice').isFloat({ min: 0 }).withMessage('سعر البيع يجب أن يكون رقم موجب'),
    body('quantity').isInt({ min: 0 }).withMessage('الكمية يجب أن تكون رقم غير سالب'),
    body('categoryId').isMongoId().withMessage('معرف الفئة مطلوب'),
    body('description').optional().isString()
  ],
  validate,
  addProductController
);

// Update product
router.put('/products/:id',
  ...adminMiddleware,
  [
    body('name').optional().notEmpty().withMessage('اسم المنتج لا يمكن أن يكون فارغ'),
    body('sku').optional().notEmpty().withMessage('رمز المنتج لا يمكن أن يكون فارغ'),
    body('originalPrice').optional().isFloat({ min: 0 }).withMessage('السعر الأصلي يجب أن يكون رقم موجب'),
    body('sellingPrice').optional().isFloat({ min: 0 }).withMessage('سعر البيع يجب أن يكون رقم موجب'),
    body('quantity').optional().isInt({ min: 0 }).withMessage('الكمية يجب أن تكون رقم غير سالب'),
    body('categoryId').optional().isMongoId().withMessage('معرف الفئة غير صحيح'),
    body('description').optional().isString()
  ],
  validate,
  updateProductController
);

// Update product image only
router.put('/products/:id/image',
  ...adminMiddleware,
  upload.single('image'),
  updateProductImageController
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
    query('q').optional().isString().withMessage('استعلام البحث يجب أن يكون نص'),
    query('category').optional().isString(),
    query('minPrice').optional().isFloat({ min: 0 }).withMessage('الحد الأدنى للسعر يجب أن يكون رقم موجب'),
    query('maxPrice').optional().isFloat({ min: 0 }).withMessage('الحد الأقصى للسعر يجب أن يكون رقم موجب')
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
    query('startDate').optional().isISO8601().withMessage('تاريخ البداية يجب أن يكون تاريخ صحيح'),
    query('endDate').optional().isISO8601().withMessage('تاريخ النهاية يجب أن يكون تاريخ صحيح'),
    query('category').optional().isString()
  ],
  validate,
  inventoryReportController
);

// Get low stock products
router.get('/low-stock',
  ...adminMiddleware,
  [
    query('threshold').optional().isInt({ min: 1 }).withMessage('العتبة يجب أن تكون رقم موجب')
  ],
  validate,
  lowStockController
);

module.exports = router;
