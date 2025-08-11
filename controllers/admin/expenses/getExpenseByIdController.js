const Expense = require('../../../models/Expense');

/**
 * Get expense by ID
 * @route GET /api/admin/expenses/:id
 * @access Private (Admin)
 */
const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    
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

    res.json({
      success: true,
      message: 'تم استرداد بيانات المصروف بنجاح',
      data: { expense }
    });

  } catch (error) {
    console.error('Get expense by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
};

module.exports = getExpenseById;
