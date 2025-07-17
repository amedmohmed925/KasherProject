const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { listTenants, getTenantDetails, createAdmin, updateAdmin, deleteAdmin, globalReport } = require('../controllers/superAdminController');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/tenants', authenticate, authorize('superAdmin'), listTenants);
router.get('/tenants/:tenantId', authenticate, authorize('superAdmin'), getTenantDetails);
router.post('/users/admin',
  authenticate,
  authorize('superAdmin'),
  body('tenantId').notEmpty(),
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  validate,
  createAdmin
);
router.put('/users/admin/:id', authenticate, authorize('superAdmin'), updateAdmin);
router.delete('/users/admin/:id', authenticate, authorize('superAdmin'), deleteAdmin);
router.get('/reports/global', authenticate, authorize('superAdmin'), globalReport);

module.exports = router;
