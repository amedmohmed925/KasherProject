const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

const registerController = require('../controllers/auth/registerController');
const loginController = require('../controllers/auth/loginController');
const verifyOtpController = require('../controllers/auth/verifyOtpController');
const forgotPasswordController = require('../controllers/auth/forgotPasswordController');
const resetPasswordController = require('../controllers/auth/resetPasswordController');
const logoutController = require('../controllers/auth/logoutController');
const refreshTokenController = require('../controllers/auth/refreshTokenController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: إدارة المصادقة والتوثيق
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: تسجيل مستخدم جديد (Admin)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: تم التسجيل بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "تم التسجيل بنجاح. يرجى التحقق من بريدك الإلكتروني."
 *       400:
 *         description: خطأ في البيانات المدخلة
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router.post('/register',
  body('firstName').notEmpty().withMessage('الاسم الأول مطلوب'),
  body('lastName').notEmpty().withMessage('الاسم الأخير مطلوب'),
  body('companyName').notEmpty().withMessage('اسم الشركة مطلوب'),
  body('companyAddress').notEmpty().withMessage('عنوان الشركة مطلوب'),
  body('phone').notEmpty().withMessage('رقم الهاتف مطلوب'),
  body('email').isEmail().withMessage('البريد الإلكتروني غير صحيح'),
  body('password').isLength({ min: 6 }).withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  body('confirmPassword').notEmpty().withMessage('تأكيد كلمة المرور مطلوب'),
  validate,
  registerController
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: تسجيل الدخول
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: تم تسجيل الدخول بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: بيانات دخول غير صحيحة
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router.post('/login',
  body('email').isEmail(),
  body('password').notEmpty(),
  validate,
  loginController
);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: تفعيل الحساب عبر OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: تم تفعيل الحساب بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email verified successfully"
 *       400:
 *         description: OTP غير صحيح أو منتهي الصلاحية
 */

router.post('/verify-otp',
  body('email').isEmail(),
  body('otp').notEmpty(),
  validate,
  verifyOtpController
);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: نسيان كلمة المرور
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@example.com
 *     responses:
 *       200:
 *         description: تم إرسال كود التحقق إلى البريد الإلكتروني
 *       404:
 *         description: البريد الإلكتروني غير موجود
 */

router.post('/forgot-password',
  body('email').isEmail(),
  validate,
  forgotPasswordController
);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: إعادة تعيين كلمة المرور
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *               - confirmNewPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 example: "newpassword123"
 *               confirmNewPassword:
 *                 type: string
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: تم تغيير كلمة المرور بنجاح
 *       400:
 *         description: OTP غير صحيح أو كلمات المرور غير متطابقة
 */

router.post('/reset-password',
  body('email').isEmail(),
  body('otp').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
  body('confirmNewPassword').notEmpty(),
  validate,
  resetPasswordController
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: تسجيل الخروج
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: تم تسجيل الخروج بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logged out successfully"
 *       401:
 *         description: غير مصرح له بالوصول
 */

router.post('/logout',
  authenticate, 
  logoutController
);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: تحديث رمز الوصول
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: تم تحديث رمز الوصول بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       403:
 *         description: رمز التحديث غير صالح
 */

router.post('/refresh-token',
  body('refreshToken').notEmpty(),
  validate,
  refreshTokenController
);

module.exports = router;