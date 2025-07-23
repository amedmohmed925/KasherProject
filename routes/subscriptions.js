const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const approveSubscriptionController = require('../controllers/superAdmin/subscriptions/approveSubscriptionController');
const listSubscriptionsController = require('../controllers/superAdmin/subscriptions/listSubscriptionsController');

const router = express.Router();

// List all subscriptions
router.get('/subscriptions', authenticate, authorize('superAdmin'), listSubscriptionsController);

// Approve or reject a subscription
router.post('/subscriptions/approve',
  authenticate,
  authorize('superAdmin'),
  body('subscriptionId').notEmpty(),
  body('status').isIn(['approved', 'rejected']),
  body('rejectionReason').if(body('status').equals('rejected')).notEmpty().withMessage('Rejection reason is required for rejected status'),
  validate,
  approveSubscriptionController
);

module.exports = router;
