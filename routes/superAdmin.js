// Get all tenants with their profits and invoices
const express = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const createAdmin = require("../controllers/superAdmin/createAdminController");
const deleteAdmin = require("../controllers/superAdmin/deleteAdminController");
const getTenantDetails = require("../controllers/superAdmin/tenants/details/getTenantDetailsController");
const deleteTenantController = require("../controllers/superAdmin/tenants/deleteTenantController");
const disableTenantController = require("../controllers/superAdmin/tenants/disableTenantController");
const getSuperAdminStatsController = require("../controllers/superAdmin/getSuperAdminStatsController");
const globalReport = require("../controllers/superAdmin/globalReportController");
const updateAdmin = require("../controllers/superAdmin/updateAdminController");
const getTenantsStatsController = require("../controllers/superAdmin/tenants/getTenantsStatsController");
const approveSubscriptionController = require('../controllers/superAdmin/subscriptions/approveSubscriptionController');
const listTenantsUnifiedController = require('../controllers/superAdmin/tenants/listTenantsUnifiedController');


const { body } = require("express-validator");
const validate = require("../middleware/validate");

const router = express.Router();


router.get(
  "/tenants/:tenantId",
  authenticate,
  authorize("superAdmin"),
  getTenantDetails
);
router.delete(
  "/tenants/:tenantId",
  authenticate,
  authorize("superAdmin"),
  deleteTenantController
);
router.put(
  "/tenants/:tenantId/disable",
  authenticate,
  authorize("superAdmin"),
  disableTenantController
);
router.get(
  "/stats",
  authenticate,
  authorize("superAdmin"),
  getSuperAdminStatsController
);
router.get(
  "/tenants-stats",
  authenticate,
  authorize("superAdmin"),
  getTenantsStatsController
);
router.post(
  "/users/admin",
  authenticate,
  authorize("superAdmin"),
  body("tenantId").notEmpty(),
  body("name").notEmpty(),
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
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
router.get(
  "/reports/global",
  authenticate,
  authorize("superAdmin"),
  globalReport
);

router.post(
  '/subscriptions/approve',
  authenticate,
  authorize('superAdmin'),
  body('subscriptionId').notEmpty(),
  body('status').isIn(['approved', 'rejected']),
  body('rejectionReason').if(body('status').equals('rejected')).notEmpty().withMessage('Rejection reason is required for rejected status'),
  validate,
  approveSubscriptionController
);

router.get('/tenants', authenticate, authorize('superAdmin'), listTenantsUnifiedController);

module.exports = router;
