const Customer = require('../../../models/Customer');
const Invoice = require('../../../models/Invoice');

/**
 * Get customer statistics
 * @route GET /api/admin/customers/stats
 * @access Private (Admin)
 */
module.exports = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { period = '30' } = req.query; // days

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get total customers
    const totalCustomers = await Customer.countDocuments({ adminId });
    const activeCustomers = await Customer.countDocuments({ adminId, status: 'active' });

    // Get new customers in period
    const newCustomers = await Customer.countDocuments({
      adminId,
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // Get top customers by total spent
    const topCustomers = await Invoice.aggregate([
      { $match: { adminId: adminId, customerId: { $exists: true } } },
      {
        $group: {
          _id: '$customerId',
          totalSpent: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          lastOrder: { $max: '$createdAt' }
        }
      },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customer'
        }
      },
      { $unwind: '$customer' },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $project: {
          name: '$customer.name',
          phone: '$customer.phone',
          totalSpent: 1,
          totalOrders: 1,
          lastOrder: 1
        }
      }
    ]);

    // Get customer activity in period
    const customerActivity = await Invoice.aggregate([
      {
        $match: {
          adminId: adminId,
          customerId: { $exists: true },
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          uniqueCustomers: { $addToSet: '$customerId' },
          totalOrders: { $sum: 1 }
        }
      },
      {
        $project: {
          date: '$_id',
          uniqueCustomers: { $size: '$uniqueCustomers' },
          totalOrders: 1,
          _id: 0
        }
      },
      { $sort: { date: 1 } }
    ]);

    // Get customers without recent orders (inactive)
    const inactiveThreshold = new Date();
    inactiveThreshold.setDate(inactiveThreshold.getDate() - 30);
    
    const inactiveCustomers = await Customer.countDocuments({
      adminId,
      $or: [
        { lastOrderDate: { $lt: inactiveThreshold } },
        { lastOrderDate: { $exists: false } }
      ]
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalCustomers,
          activeCustomers,
          inactiveCustomers,
          newCustomers,
          period: parseInt(period)
        },
        topCustomers,
        activity: customerActivity
      }
    });

  } catch (error) {
    console.error('Error getting customer stats:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
};
