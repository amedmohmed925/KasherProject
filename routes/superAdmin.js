// Removed tenant-related routes and imports as tenants are no longer part of the system.
const express = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const createAdmin = require("../controllers/superAdmin/createAdminController");
const deleteAdmin = require("../controllers/superAdmin/deleteAdminController");
const getSuperAdminStatsController = require("../controllers/superAdmin/getSuperAdminStatsController");
const globalReport = require("../controllers/superAdmin/globalReportController");
const updateAdmin = require("../controllers/superAdmin/updateAdminController");
const approveSubscriptionController = require('../controllers/superAdmin/subscriptions/approveSubscriptionController');

const { body } = require("express-validator");
const validate = require("../middleware/validate");

const router = express.Router();

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

module.exports = router;
