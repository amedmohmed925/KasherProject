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

router.post('/login',
  body('email').isEmail(),
  body('password').notEmpty(),
  validate,
  loginController
);

router.post('/verify-otp',
  body('email').isEmail(),
  body('otp').notEmpty(),
  validate,
  verifyOtpController
);

router.post('/forgot-password',
  body('email').isEmail(),
  validate,
  forgotPasswordController
);

router.post('/reset-password',
  body('email').isEmail(),
  body('otp').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
  body('confirmNewPassword').notEmpty(),
  validate,
  resetPasswordController
);

router.post('/logout',
  authenticate, 
  logoutController
);

router.post('/refresh-token',
  body('refreshToken').notEmpty(),
  validate,
  refreshTokenController
);

module.exports = router;