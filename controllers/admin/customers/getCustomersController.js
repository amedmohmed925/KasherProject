const Customer = require('../../../models/Customer');

/**
 * Get all customers for admin
 * @route GET /api/admin/customers
 * @access Private (Admin)
 */
module.exports = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { page = 1, limit = 10, search, status = 'active' } = req.query;

    // Build search query
    let query = { adminId };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await Customer.countDocuments(query);

    // Get customers with pagination
    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    res.json({
      success: true,
      data: {
        customers,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error getting customers:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
};
