const Expense = require('../../../models/Expense');
const { validationResult } = require('express-validator');

/**
 * Add new expense
 * @route POST /api/admin/expenses
 * @access Private (Admin)
 */
const addExpense = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'خطأ في البيانات المدخلة',
        errors: errors.array()
      });
    }

    const { title, amount, category, description, date } = req.body;
    const adminId = req.user.id;

    // Create new expense
    const expense = new Expense({
      adminId,
      title,
      amount,
      category,
      description,
      date: date ? new Date(date) : new Date()
    });

    await expense.save();

    res.status(201).json({
      success: true,
      message: 'تم إضافة المصروف بنجاح',
      data: expense
    });

  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
};

module.exports = addExpense;
