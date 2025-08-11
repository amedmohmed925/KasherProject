const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const checkSubscription = require('../middleware/checkSubscription');
const validate = require('../middleware/validate');

// Import expense controllers
const addExpenseController = require('../controllers/admin/expenses/addExpenseController');
const getExpensesController = require('../controllers/admin/expenses/getExpensesController');
const getExpenseByIdController = require('../controllers/admin/expenses/getExpenseByIdController');
const updateExpenseController = require('../controllers/admin/expenses/updateExpenseController');
const deleteExpenseController = require('../controllers/admin/expenses/deleteExpenseController');
const getExpenseStatsController = require('../controllers/admin/expenses/getExpenseStatsController');

// Expense validation rules
const expenseValidation = [
  validate.body('description').notEmpty().withMessage('وصف المصروف مطلوب'),
  validate.body('amount').isNumeric().withMessage('المبلغ يجب أن يكون رقم'),
  validate.body('category').notEmpty().withMessage('فئة المصروف مطلوبة'),
  validate.body('date').optional().isISO8601().withMessage('التاريخ غير صالح')
];

// Expense Routes

/**
 * @swagger
 * /api/admin/expenses:
 *   get:
 *     summary: Get all expenses
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authMiddleware, checkSubscription, getExpensesController);

/**
 * @swagger
 * /api/admin/expenses:
 *   post:
 *     summary: Add new expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authMiddleware, checkSubscription, expenseValidation, addExpenseController);

/**
 * @swagger
 * /api/admin/expenses/{id}:
 *   get:
 *     summary: Get expense by ID
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authMiddleware, checkSubscription, getExpenseByIdController);

/**
 * @swagger
 * /api/admin/expenses/{id}:
 *   put:
 *     summary: Update expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authMiddleware, checkSubscription, expenseValidation, updateExpenseController);

/**
 * @swagger
 * /api/admin/expenses/{id}:
 *   delete:
 *     summary: Delete expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authMiddleware, checkSubscription, deleteExpenseController);

/**
 * @swagger
 * /api/admin/expenses/stats/overview:
 *   get:
 *     summary: Get expense statistics
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats/overview', authMiddleware, checkSubscription, getExpenseStatsController);

module.exports = router;
