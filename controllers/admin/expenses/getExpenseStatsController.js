const Expense = require('../../../models/Expense');

/**
 * Get expense statistics
 * @route GET /api/admin/expenses/stats/overview
 * @access Private (Admin)
 */
const getExpenseStats = async (req, res) => {
  try {
    const adminId = req.user.id;
    
    // Get date ranges
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Basic stats
    const totalExpenses = await Expense.countDocuments({ adminId });
    const totalAmount = await Expense.aggregate([
      { $match: { adminId: adminId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Today's expenses
    const todayExpenses = await Expense.aggregate([
      { 
        $match: { 
          adminId: adminId,
          date: { $gte: startOfToday }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    // This week's expenses
    const weekExpenses = await Expense.aggregate([
      { 
        $match: { 
          adminId: adminId,
          date: { $gte: startOfWeek }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    // This month's expenses
    const monthExpenses = await Expense.aggregate([
      { 
        $match: { 
          adminId: adminId,
          date: { $gte: startOfMonth }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    // Expenses by category
    const expensesByCategory = await Expense.aggregate([
      { $match: { adminId: adminId } },
      { 
        $group: { 
          _id: '$category', 
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Recent expenses
    const recentExpenses = await Expense.find({ adminId })
      .sort({ date: -1 })
      .limit(5)
      .select('description amount category date');

    res.json({
      success: true,
      message: 'تم استرداد إحصائيات المصروفات بنجاح',
      data: {
        overview: {
          total: {
            expenses: totalExpenses,
            amount: totalAmount[0]?.total || 0
          },
          today: {
            expenses: todayExpenses[0]?.count || 0,
            amount: todayExpenses[0]?.total || 0
          },
          week: {
            expenses: weekExpenses[0]?.count || 0,
            amount: weekExpenses[0]?.total || 0
          },
          month: {
            expenses: monthExpenses[0]?.count || 0,
            amount: monthExpenses[0]?.total || 0
          }
        },
        categories: expensesByCategory,
        recent: recentExpenses
      }
    });

  } catch (error) {
    console.error('Get expense stats error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
};

module.exports = getExpenseStats;
