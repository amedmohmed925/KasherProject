const Invoice = require('../../../models/Invoice');
const Customer = require('../../../models/Customer');
const Product = require('../../../models/Product');

/**
 * Get enhanced analytics for admin dashboard
 * 
 * Profit Calculation:
 * - itemProfit = (sellingPrice - originalPrice) × quantity
 * - totalProfit = sum of all itemProfits in invoice
 * - totalExpenses = sum of (originalPrice × quantity) for sold items
 * - netProfit = totalProfit (expenses already deducted in profit calculation)
 * 
 * @route GET /api/admin/analytics/enhanced
 * @access Private (Admin)
 */
const getEnhancedAnalytics = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { period = '30' } = req.query; // days

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Revenue and orders analytics
    const revenueStats = await Invoice.aggregate([
      { 
        $match: { 
          adminId: adminId,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          totalProfit: { $sum: '$profit' },
          averageOrderValue: { $avg: '$totalAmount' },
          totalDiscount: { $sum: '$discount.amount' }
        }
      }
    ]);

    // Calculate total expenses from sold products' original prices
    const expenseStats = await Invoice.aggregate([
      {
        $match: {
          adminId: adminId,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: null,
          totalExpenses: { 
            $sum: { 
              $multiply: ['$items.quantity', '$items.originalPrice'] 
            }
          }
        }
      }
    ]);

    // Top selling products
    const topProducts = await Invoice.aggregate([
      { 
        $match: { 
          adminId: adminId,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
      {
        $project: {
          name: '$product.name',
          sku: '$product.sku',
          totalQuantity: 1,
          totalRevenue: 1,
          orderCount: 1
        }
      }
    ]);

    // Daily sales trend
    const dailyTrend = await Invoice.aggregate([
      {
        $match: {
          adminId: adminId,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
          profit: { $sum: '$profit' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Calculate daily expenses from sold products' original prices
    const dailyExpenses = await Invoice.aggregate([
      {
        $match: {
          adminId: adminId,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          expenses: { 
            $sum: { 
              $multiply: ['$items.quantity', '$items.originalPrice'] 
            }
          }
        }
      }
    ]);

    // Merge expenses with daily trend
    const expenseMap = new Map(dailyExpenses.map(e => [e._id, e.expenses]));
    dailyTrend.forEach(day => {
      day.expenses = expenseMap.get(day._id) || 0;
      // netProfit = profit (because profit already accounts for costs)
      day.netProfit = day.profit;
    });

    // Customer analytics
    const customerAnalytics = await Customer.aggregate([
      { $match: { adminId: adminId } },
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          activeCustomers: {
            $sum: {
              $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
            }
          }
        }
      }
    ]);

    // Payment method distribution
    const paymentMethods = await Invoice.aggregate([
      {
        $match: {
          adminId: adminId,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          amount: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Low stock alerts
    const lowStock = await Product.find({
      adminId: adminId,
      quantity: { $lte: 10 }
    }).select('name sku quantity').limit(10);

    const revenue = revenueStats[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      totalProfit: 0,
      averageOrderValue: 0,
      totalDiscount: 0
    };

    const expenses = expenseStats[0] || {
      totalExpenses: 0
    };

    const customers = customerAnalytics[0] || {
      totalCustomers: 0,
      activeCustomers: 0
    };

    // Calculate net profit (using calculated expenses from product costs)
    const netProfit = revenue.totalProfit;

    res.json({
      success: true,
      data: {
        overview: {
          totalRevenue: revenue.totalRevenue,
          totalOrders: revenue.totalOrders,
          totalProfit: revenue.totalProfit,
          totalExpenses: expenses.totalExpenses,
          netProfit,
          averageOrderValue: revenue.averageOrderValue,
          totalDiscount: revenue.totalDiscount,
          totalCustomers: customers.totalCustomers,
          activeCustomers: customers.activeCustomers,
          period: parseInt(period)
        },
        topProducts,
        dailyTrend,
        paymentMethods,
        lowStock
      }
    });

  } catch (error) {
    console.error('Error getting enhanced analytics:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
};

module.exports = getEnhancedAnalytics;
