const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const checkSubscription = require('../middleware/checkSubscription');
const addProduct = require('../controllers/admin/products/addProductController');
const getProducts = require('../controllers/admin/products/getProductsController');
const deleteProduct = require('../controllers/admin/products/deleteProductController');
const updateProduct = require('../controllers/admin/products/updateProductController');
const updateProductImage = require('../controllers/admin/products/updateProductImageController');
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
const getProfileController = require('../controllers/admin/getProfileController');
const updateProfileController = require('../controllers/admin/updateProfileController');
const getAdvancedAnalyticsController = require('../controllers/admin/getAdvancedAnalyticsController');

// Multer configuration for file uploads
const multer = require('multer');
const upload = multer({ 
  dest: 'uploads/',
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

// Add product with image upload
router.post('/products',
  ...adminMiddleware,
  upload.single('image'),
  body('name').notEmpty().withMessage('اسم المنتج مطلوب'),
  body('sku').notEmpty().withMessage('رمز المنتج مطلوب'),
  body('originalPrice').isNumeric().withMessage('السعر الأصلي يجب أن يكون رقم'),
  body('sellingPrice').isNumeric().withMessage('سعر البيع يجب أن يكون رقم'),
  body('quantity').isInt({ min: 0 }).withMessage('الكمية يجب أن تكون رقم غير سالب'),
  body('categoryId').notEmpty().withMessage('الفئة مطلوبة'),
  body('description').optional().isString(),
  validate,
  addProduct
);

// Update product (without image)
router.put('/products/:id',
  ...adminMiddleware,
  body('name').optional().notEmpty().withMessage('اسم المنتج لا يمكن أن يكون فارغ'),
  body('sku').optional().notEmpty().withMessage('رمز المنتج لا يمكن أن يكون فارغ'),
  body('originalPrice').optional().isNumeric().withMessage('السعر الأصلي يجب أن يكون رقم'),
  body('sellingPrice').optional().isNumeric().withMessage('سعر البيع يجب أن يكون رقم'),
  body('quantity').optional().isInt({ min: 0 }).withMessage('الكمية يجب أن تكون رقم غير سالب'),
  body('categoryId').optional().isMongoId().withMessage('معرف الفئة غير صحيح'),
  body('description').optional().isString(),
  body('image').optional().isURL().withMessage('رابط الصورة غير صحيح'),
  validate,
  updateProduct
);

// Update product image
router.put('/products/:id/image',
  ...adminMiddleware,
  upload.single('image'),
  updateProductImage
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

// Advanced Analytics with filters
router.get('/analytics/advanced', ...adminMiddleware, getAdvancedAnalyticsController);

// Profile Management
router.get('/profile', ...adminMiddleware, getProfileController);
router.put('/profile', 
  ...adminMiddleware,
  [
    body('firstName').optional().notEmpty().withMessage('الاسم الأول لا يمكن أن يكون فارغ'),
    body('lastName').optional().notEmpty().withMessage('الاسم الأخير لا يمكن أن يكون فارغ'),
    body('companyName').optional().notEmpty().withMessage('اسم الشركة لا يمكن أن يكون فارغ'),
    body('companyAddress').optional().notEmpty().withMessage('عنوان الشركة لا يمكن أن يكون فارغ'),
    body('phone').optional().notEmpty().withMessage('رقم الهاتف لا يمكن أن يكون فارغ'),
    body('newPassword').optional().isLength({ min: 6 }).withMessage('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل'),
    body('currentPassword').if(body('newPassword').exists()).notEmpty().withMessage('كلمة المرور الحالية مطلوبة لتغيير كلمة المرور')
  ],
  validate,
  updateProfileController
);

// Get admin by ID
router.get('/admin/:id', ...adminSuperAdminMiddleware, getAdminByIdController);


module.exports = router;
