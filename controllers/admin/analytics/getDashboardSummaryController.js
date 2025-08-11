const Invoice = require('../../../models/Invoice');
const Customer = require('../../../models/Customer');
const Product = require('../../../models/Product');

/**
 * Get dashboard summary with key metrics
 * @route GET /api/admin/analytics/summary
 * @access Private (Admin)
 */
const getDashboardSummary = async (req, res) => {
  try {
    const adminId = req.user.id;
    
    // تحديد الفترات الزمنية
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    thisWeekStart.setHours(0, 0, 0, 0);

    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);

    const thisYearStart = new Date();
    thisYearStart.setMonth(0, 1);
    thisYearStart.setHours(0, 0, 0, 0);

    // الحصول على البيانات لجميع الفترات
    const periods = [
      { name: 'today', start: today, end: endOfToday, label: 'اليوم' },
      { name: 'week', start: thisWeekStart, end: new Date(), label: 'هذا الأسبوع' },
      { name: 'month', start: thisMonthStart, end: new Date(), label: 'هذا الشهر' },
      { name: 'year', start: thisYearStart, end: new Date(), label: 'هذا العام' }
    ];

    const summaryData = {};

    for (const period of periods) {
      const dateRange = { $gte: period.start, $lte: period.end };

      // الإحصائيات الأساسية
      const stats = await Invoice.aggregate([
        {
          $match: {
            adminId: adminId,
            createdAt: dateRange
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            totalOrders: { $sum: 1 },
            totalProfit: { $sum: '$profit' },
            averageOrderValue: { $avg: '$totalAmount' }
          }
        }
      ]);

      // المصروفات
      const expenses = await Invoice.aggregate([
        {
          $match: {
            adminId: adminId,
            createdAt: dateRange
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
            },
            totalItemsSold: { $sum: '$items.quantity' }
          }
        }
      ]);

      // العملاء الفريدين
      const customers = await Invoice.aggregate([
        {
          $match: {
            adminId: adminId,
            createdAt: dateRange,
            customerId: { $exists: true, $ne: null }
          }
        },
        {
          $group: {
            _id: '$customerId'
          }
        },
        {
          $count: 'uniqueCustomers'
        }
      ]);

      const periodStats = stats[0] || {
        totalRevenue: 0,
        totalOrders: 0,
        totalProfit: 0,
        averageOrderValue: 0
      };

      const periodExpenses = expenses[0] || {
        totalExpenses: 0,
        totalItemsSold: 0
      };

      const periodCustomers = customers[0] || { uniqueCustomers: 0 };

      summaryData[period.name] = {
        label: period.label,
        revenue: periodStats.totalRevenue,
        orders: periodStats.totalOrders,
        profit: periodStats.totalProfit,
        expenses: periodExpenses.totalExpenses,
        netProfit: periodStats.totalProfit,
        averageOrder: periodStats.averageOrderValue,
        itemsSold: periodExpenses.totalItemsSold,
        customers: periodCustomers.uniqueCustomers
      };
    }

    // أهم المؤشرات العامة
    const generalStats = await Promise.all([
      // إجمالي العملاء
      Customer.countDocuments({ adminId }),
      
      // العملاء النشطين
      Customer.countDocuments({ adminId, status: 'active' }),
      
      // إجمالي المنتجات
      Product.countDocuments({ adminId }),
      
      // المنتجات منخفضة المخزون
      Product.countDocuments({ adminId, quantity: { $lte: 10 } }),
      
      // إجمالي الفواتير
      Invoice.countDocuments({ adminId })
    ]);

    // آخر 5 فواتير
    const recentInvoices = await Invoice.find({ adminId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('invoiceNumber customer.name totalAmount createdAt')
      .lean();

    // أفضل 5 منتجات هذا الشهر
    const topProductsThisMonth = await Invoice.aggregate([
      {
        $match: {
          adminId: adminId,
          createdAt: { $gte: thisMonthStart }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 }
    ]);

    // حساب النمو مقارنة بالشهر الماضي
    const lastMonthStart = new Date();
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1, 1);
    lastMonthStart.setHours(0, 0, 0, 0);
    const lastMonthEnd = new Date();
    lastMonthEnd.setDate(0);
    lastMonthEnd.setHours(23, 59, 59, 999);

    const lastMonthStats = await Invoice.aggregate([
      {
        $match: {
          adminId: adminId,
          createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          totalProfit: { $sum: '$profit' }
        }
      }
    ]);

    const lastMonth = lastMonthStats[0] || { totalRevenue: 0, totalOrders: 0, totalProfit: 0 };
    const thisMonth = summaryData.month;

    const growth = {
      revenue: calculateGrowthRate(thisMonth.revenue, lastMonth.totalRevenue),
      orders: calculateGrowthRate(thisMonth.orders, lastMonth.totalOrders),
      profit: calculateGrowthRate(thisMonth.profit, lastMonth.totalProfit)
    };

    res.json({
      success: true,
      data: {
        periods: summaryData,
        overview: {
          totalCustomers: generalStats[0],
          activeCustomers: generalStats[1],
          totalProducts: generalStats[2],
          lowStockProducts: generalStats[3],
          totalInvoices: generalStats[4]
        },
        growth,
        recentInvoices,
        topProducts: topProductsThisMonth,
        alerts: {
          lowStock: generalStats[3] > 0,
          lowStockCount: generalStats[3]
        }
      }
    });

  } catch (error) {
    console.error('Error getting dashboard summary:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
};

// دالة لحساب معدل النمو
function calculateGrowthRate(current, previous) {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Number((((current - previous) / previous) * 100).toFixed(2));
}

module.exports = getDashboardSummary;
