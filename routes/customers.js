const express = require('express');
const router = express.Router();
// Destructure the authenticate function (previously imported object caused Route.get() callback error)
const { authenticate: authMiddleware } = require('../middleware/auth');
const checkSubscription = require('../middleware/checkSubscription');
const { body } = require('express-validator');

// Import customer controllers
const addCustomerController = require('../controllers/admin/customers/addCustomerController');
const getCustomersController = require('../controllers/admin/customers/getCustomersController');
const getCustomerByIdController = require('../controllers/admin/customers/getCustomerByIdController');
const updateCustomerController = require('../controllers/admin/customers/updateCustomerController');
const deleteCustomerController = require('../controllers/admin/customers/deleteCustomerController');
const getCustomerStatsController = require('../controllers/admin/customers/getCustomerStatsController');

// Customer validation rules
const customerValidation = [
  body('name').notEmpty().withMessage('اسم العميل مطلوب'),
  body('email').optional().isEmail().withMessage('البريد الإلكتروني غير صالح'),
  body('phone').notEmpty().withMessage('رقم الهاتف مطلوب'),
  body('address').optional().isString()
];

// Customer Routes

/**
 * @swagger
 * /api/admin/customers:
 *   get:
 *     summary: Get all customers
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authMiddleware, checkSubscription, getCustomersController);

/**
 * @swagger
 * /api/admin/customers:
 *   post:
 *     summary: Add new customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authMiddleware, checkSubscription, customerValidation, addCustomerController);

/**
 * IMPORTANT: Define stats route BEFORE any route with :id to avoid /stats being captured as an ID
 */
/**
 * @swagger
 * /api/admin/customers/stats/overview:
 *   get:
 *     summary: Get customer statistics
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats/overview', authMiddleware, checkSubscription, getCustomerStatsController);

/**
 * @swagger
 * /api/admin/customers/{id}:
 *   get:
 *     summary: Get customer by ID
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authMiddleware, checkSubscription, getCustomerByIdController);

/**
 * @swagger
 * /api/admin/customers/{id}:
 *   put:
 *     summary: Update customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authMiddleware, checkSubscription, customerValidation, updateCustomerController);

/**
 * @swagger
 * /api/admin/customers/{id}:
 *   delete:
 *     summary: Delete customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authMiddleware, checkSubscription, deleteCustomerController);

module.exports = router;
