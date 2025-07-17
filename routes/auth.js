const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

const registerController = require('../controllers/auth/registerController');
const loginController = require('../controllers/auth/loginController');
const inviteEmployeeController = require('../controllers/auth/inviteEmployeeController');
const acceptInviteController = require('../controllers/auth/acceptInviteController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/register',
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('role').notEmpty(),
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

// Invite employee (admin/superAdmin only)
router.post('/invite-employee', authenticate, inviteEmployeeController);

// Get invite info (for employee registration page)
const getInviteInfoController = require('../controllers/auth/getInviteInfoController');
router.get('/invite-info', getInviteInfoController);

// Accept invite (employee registration)
router.post('/accept-invite', acceptInviteController);
