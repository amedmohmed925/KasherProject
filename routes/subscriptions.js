const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

const approveSubscriptionController = require('../controllers/superAdmin/subscriptions/approveSubscriptionController');
const listSubscriptionsController = require('../controllers/superAdmin/subscriptions/listSubscriptionsController');
const uploadSubscriptionReceiptController = require('../controllers/admin/uploadSubscriptionReceiptController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const router = express.Router();


router.post('/subscriptions/upload',
  authenticate,
  authorize('admin'),
  upload.single('receipt'),
  body('plan').isIn(['monthly', 'yearly', 'custom']).withMessage('Plan is required'),
  body('paidAmountText').notEmpty().withMessage('Paid amount is required'),
  body('duration').isIn(['month', 'year', 'custom']).withMessage('Duration is required'),
  body('price').isNumeric().withMessage('Price is required'),
  body('startDate').notEmpty().withMessage('Start date is required'),
  body('endDate').notEmpty().withMessage('End date is required'),
  validate,
  uploadSubscriptionReceiptController
);


router.get('/', authenticate, authorize('superAdmin'), listSubscriptionsController);


router.post('/:subscriptionId/approve',
  authenticate,
  authorize('superAdmin'),
  body('status').isIn(['approved', 'rejected']),
  body('rejectionReason').if(body('status').equals('rejected')).notEmpty().withMessage('Rejection reason is required for rejected status'),
  validate,
  approveSubscriptionController
);

module.exports = router;
