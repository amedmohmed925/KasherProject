const Expense = require('../../../models/Expense');

/**
 * Get all expenses for admin
 * @route GET /api/admin/expenses
 * @access Private (Admin)
 */
const getExpenses = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { 
      page = 1, 
      limit = 10, 
      category, 
      startDate, 
      endDate,
      search 
    } = req.query;

    // Build search query
    let query = { adminId };
    
    if (category && category !== 'all') {
      query.category = category;
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await Expense.countDocuments(query);

    // Get expenses with pagination
    const expenses = await Expense.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    // Calculate total amount for current query
    const totalAmount = await Expense.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      data: {
        expenses,
        totalAmount: totalAmount[0]?.total || 0,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error getting expenses:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
};

module.exports = getExpenses;
