const Expense = require('../../../models/Expense');
const { validationResult } = require('express-validator');

/**
 * Update expense
 * @route PUT /api/admin/expenses/:id
 * @access Private (Admin)
 */
const updateExpense = async (req, res) => {
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

    const { id } = req.params;
    const { description, amount, category, date, notes } = req.body;

    // Find expense
    const expense = await Expense.findOne({
      _id: id,
      adminId: req.user.id
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'المصروف غير موجود'
      });
    }

    // Update expense
    expense.description = description || expense.description;
    expense.amount = amount || expense.amount;
    expense.category = category || expense.category;
    expense.date = date || expense.date;
    expense.notes = notes || expense.notes;

    await expense.save();

    res.json({
      success: true,
      message: 'تم تحديث المصروف بنجاح',
      data: { expense }
    });

  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
};

module.exports = updateExpense;
