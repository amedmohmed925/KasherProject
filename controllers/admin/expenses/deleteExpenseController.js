const Expense = require('../../../models/Expense');

/**
 * Delete expense
 * @route DELETE /api/admin/expenses/:id
 * @access Private (Admin)
 */
const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete expense
    const expense = await Expense.findOneAndDelete({
      _id: id,
      adminId: req.user.id
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'المصروف غير موجود'
      });
    }

    res.json({
      success: true,
      message: 'تم حذف المصروف بنجاح',
      data: { expense }
    });

  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
};

module.exports = deleteExpense;
