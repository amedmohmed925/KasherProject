const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

const registerController = require('../controllers/auth/registerController');
const loginController = require('../controllers/auth/loginController');
const inviteEmployeeController = require('../controllers/auth/inviteEmployeeController');
const acceptInviteController = require('../controllers/auth/acceptInviteController');
const verifyOtpController = require('../controllers/auth/verifyOtpController');
const forgotPasswordController = require('../controllers/auth/forgotPasswordController');
const resetPasswordController = require('../controllers/auth/resetPasswordController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/register',
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('companyName').notEmpty(),
  body('companyAddress').notEmpty(),
  validate,
  registerController
);

router.post('/login',
  body('email').isEmail(),
  body('password').notEmpty(),
  validate,
  loginController
);

module.exports = router;

// Verify email OTP
router.post('/verify-otp', verifyOtpController);

// Invite employee (admin/superAdmin only)
router.post('/invite-employee', authenticate, inviteEmployeeController);

// Get invite info (for employee registration page)
const getInviteInfoController = require('../controllers/auth/getInviteInfoController');
router.get('/invite-info', getInviteInfoController);

// Accept invite (employee registration)
router.post('/accept-invite', acceptInviteController);

// Forgot password (send OTP)
router.post('/forgot-password',
  body('email').isEmail(),
  validate,
  forgotPasswordController
);

// Reset password (with OTP)
router.post('/reset-password',
  body('email').isEmail(),
  body('otp').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
  body('confirmNewPassword').notEmpty(),
  validate,
  resetPasswordController
);
