const express = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const createAdmin = require("../controllers/superAdmin/createAdminController");
const deleteAdmin = require("../controllers/superAdmin/deleteAdminController");
const getSuperAdminStatsController = require("../controllers/superAdmin/getSuperAdminStatsController");
const globalReport = require("../controllers/superAdmin/globalReportController");
const updateAdmin = require("../controllers/superAdmin/updateAdminController");
const approveSubscriptionController = require('../controllers/superAdmin/subscriptions/approveSubscriptionController');
const listSubscriptionsController = require('../controllers/superAdmin/subscriptions/listSubscriptionsController');
const sendNotificationController = require('../controllers/superAdmin/sendNotificationController');
const getAllProductsController = require('../controllers/superAdmin/getAllProductsController');
const getAllInvoicesController = require('../controllers/superAdmin/getAllInvoicesController');
const getAdminProductsController = require('../controllers/superAdmin/getAdminProductsController');
const getAdminInvoicesController = require('../controllers/superAdmin/getAdminInvoicesController');

const { body, query } = require("express-validator");
const validate = require("../middleware/validate");

const router = express.Router();

// إحصائيات السوبر أدمن
router.get(
  "/stats",
  authenticate,
  authorize("superAdmin"),
  getSuperAdminStatsController
);
router.post(
  "/users/admin",
  authenticate,
  authorize("superAdmin"),
  body("firstName").notEmpty().withMessage('الاسم الأول مطلوب'),
  body("lastName").notEmpty().withMessage('الاسم الأخير مطلوب'),
  body("companyName").notEmpty().withMessage('اسم الشركة مطلوب'),
  body("companyAddress").notEmpty().withMessage('عنوان الشركة مطلوب'),
  body("phone").notEmpty().withMessage('رقم الهاتف مطلوب'),
  body("email").isEmail().withMessage('البريد الإلكتروني غير صحيح'),
  body("password").isLength({ min: 6 }).withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  validate,
  createAdmin
);
router.put(
  "/users/admin/:id",
  authenticate,
  authorize("superAdmin"),
  updateAdmin
);
router.delete(
  "/users/admin/:id",
  authenticate,
  authorize("superAdmin"),
  deleteAdmin
);

// جلب جميع الأدمن
router.get(
  "/users/admins",
  authenticate,
  authorize("superAdmin"),
  async (req, res) => {
    try {
      const User = require('../models/User');
      const admins = await User.find({ role: 'admin' }).select('-password');
      res.json(admins);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// جلب أدمن بالـ ID
router.get(
  "/users/admin/:id",
  authenticate,
  authorize("superAdmin"),
  async (req, res) => {
    try {
      const User = require('../models/User');
      const admin = await User.findOne({ _id: req.params.id, role: 'admin' }).select('-password');
      if (!admin) return res.status(404).json({ message: 'الأدمن غير موجود' });
      res.json(admin);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

router.get(
  "/reports/global",
  authenticate,
  authorize("superAdmin"),
  globalReport
);

// جلب جميع الاشتراكات
router.get(
  "/subscriptions",
  authenticate,
  authorize("superAdmin"),
  listSubscriptionsController
);

router.post(
  '/subscriptions/:subscriptionId/approve',
  authenticate,
  authorize('superAdmin'),
  body('status').isIn(['approved', 'rejected']).withMessage('الحالة يجب أن تكون approved أو rejected'),
  body('rejectionReason').if(body('status').equals('rejected')).notEmpty().withMessage('سبب الرفض مطلوب عند الرفض'),
  validate,
  approveSubscriptionController
);

// إرسال إشعارات للمستخدمين
router.post(
  '/notifications/send',
  authenticate,
  authorize('superAdmin'),
  [
    body('recipients').notEmpty().withMessage('المستقبلين مطلوبين'),
    body('recipients.type').isIn(['all', 'specific', 'verified', 'unverified']).withMessage('نوع المستقبلين غير صحيح'),
    body('recipients.userIds').if(body('recipients.type').equals('specific')).isArray().withMessage('معرفات المستخدمين يجب أن تكون مصفوفة'),
    body('subject').notEmpty().withMessage('موضوع الرسالة مطلوب'),
    body('message').notEmpty().withMessage('نص الرسالة مطلوب'),
    body('type').optional().isIn(['email']).withMessage('نوع الإشعار غير صحيح')
  ],
  validate,
  sendNotificationController
);

// عرض جميع المنتجات عبر جميع الأدمنز
router.get(
  '/products',
  authenticate,
  authorize('superAdmin'),
  [
    query('adminId').optional().isMongoId().withMessage('معرف الأدمن غير صحيح'),
    query('categoryId').optional().isMongoId().withMessage('معرف الفئة غير صحيح'),
    query('page').optional().isInt({ min: 1 }).withMessage('رقم الصفحة يجب أن يكون رقم موجب'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('حد النتائج يجب أن يكون بين 1 و 100'),
    query('minPrice').optional().isFloat({ min: 0 }).withMessage('الحد الأدنى للسعر يجب أن يكون رقم موجب'),
    query('maxPrice').optional().isFloat({ min: 0 }).withMessage('الحد الأقصى للسعر يجب أن يكون رقم موجب')
  ],
  validate,
  getAllProductsController
);

// عرض جميع الفواتير عبر جميع الأدمنز
router.get(
  '/invoices',
  authenticate,
  authorize('superAdmin'),
  [
    query('adminId').optional().isMongoId().withMessage('معرف الأدمن غير صحيح'),
    query('page').optional().isInt({ min: 1 }).withMessage('رقم الصفحة يجب أن يكون رقم موجب'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('حد النتائج يجب أن يكون بين 1 و 100'),
    query('minAmount').optional().isFloat({ min: 0 }).withMessage('الحد الأدنى للمبلغ يجب أن يكون رقم موجب'),
    query('maxAmount').optional().isFloat({ min: 0 }).withMessage('الحد الأقصى للمبلغ يجب أن يكون رقم موجب'),
    query('startDate').optional().isISO8601().withMessage('تاريخ البداية غير صحيح'),
    query('endDate').optional().isISO8601().withMessage('تاريخ النهاية غير صحيح')
  ],
  validate,
  getAllInvoicesController
);

// عرض المنتجات الخاصة بأدمن محدد
router.get(
  '/admins/:id/products',
  authenticate,
  authorize('superAdmin'),
  [
    query('categoryId').optional().isMongoId().withMessage('معرف الفئة غير صحيح'),
    query('page').optional().isInt({ min: 1 }).withMessage('رقم الصفحة يجب أن يكون رقم موجب'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('حد النتائج يجب أن يكون بين 1 و 100'),
    query('minPrice').optional().isFloat({ min: 0 }).withMessage('الحد الأدنى للسعر يجب أن يكون رقم موجب'),
    query('maxPrice').optional().isFloat({ min: 0 }).withMessage('الحد الأقصى للسعر يجب أن يكون رقم موجب')
  ],
  validate,
  getAdminProductsController
);

// عرض الفواتير الخاصة بأدمن محدد
router.get(
  '/admins/:id/invoices',
  authenticate,
  authorize('superAdmin'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('رقم الصفحة يجب أن يكون رقم موجب'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('حد النتائج يجب أن يكون بين 1 و 100'),
    query('minAmount').optional().isFloat({ min: 0 }).withMessage('الحد الأدنى للمبلغ يجب أن يكون رقم موجب'),
    query('maxAmount').optional().isFloat({ min: 0 }).withMessage('الحد الأقصى للمبلغ يجب أن يكون رقم موجب'),
    query('startDate').optional().isISO8601().withMessage('تاريخ البداية غير صحيح'),
    query('endDate').optional().isISO8601().withMessage('تاريخ النهاية غير صحيح')
  ],
  validate,
  getAdminInvoicesController
);

module.exports = router;
